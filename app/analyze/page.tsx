'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Folder, FileCode, ChevronRight, Book, Code, Loader2, AlertCircle, MessageSquare, Send, X, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Mermaid from '@/components/Mermaid';

// Types
type FileNode = {
    name: string;
    path: string;
    type: 'file' | 'dir';
    url?: string;
    children?: FileNode[]; // For recursion
};

export default function AnalyzePage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <AnalyzeContent />
        </Suspense>
    );
}

function AnalyzeContent() {
    const searchParams = useSearchParams();
    const rawRepo = searchParams.get('repo');
    // Robustly handle full URLs or clean paths
    const repo = rawRepo ? rawRepo.replace(/^(https?:\/\/)?(www\.)?github\.com\//, '').replace(/\/$/, '') : null;

    const [fileTree, setFileTree] = useState<FileNode[]>([]);
    const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
    const [fileContent, setFileContent] = useState<string>('');
    const [contentLoading, setContentLoading] = useState(false);

    // Wiki / Analysis State
    const [activeTab, setActiveTab] = useState<'code' | 'wiki'>('wiki');
    const [wikiContent, setWikiContent] = useState('');
    const [wikiLoading, setWikiLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Chat State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    useEffect(() => {
        if (repo) {
            fetchRepoContents(repo).then(data => {
                if (data) setFileTree(data);
            });
        }
    }, [repo]);

    async function fetchRepoContents(repoPath: string, path = ''): Promise<FileNode[] | null> {
        try {
            // Use our own proxy to handle auth/rate limits
            const res = await fetch(`/api/github?endpoint=repos/${repoPath}/contents/${path}`);

            if (res.status === 403 || res.status === 429) {
                setError('GitHub API rate limit exceeded. Please add GITHUB_TOKEN to .env.local');
                return null;
            }
            if (res.status === 404) {
                setError('Repository not found. Please check the URL.');
                return null;
            }
            if (!res.ok) throw new Error('Failed to fetch repository contents');

            const data = await res.json();

            if (!Array.isArray(data)) {
                // If it's a file, returns object, but we expect directory listing here usually
                return [];
            }

            const nodes: FileNode[] = data.map((item: any) => ({
                name: item.name,
                path: item.path,
                type: item.type,
                url: item.url
            })).sort((a: FileNode, b: FileNode) => {
                // Folders first
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'dir' ? -1 : 1;
            });

            return nodes;

        } catch (error) {
            console.error(error);
            setError('Failed to load files.');
            return null;
        }
    }

    async function handleFileClick(file: FileNode) {
        setSelectedFile(file);
        setContentLoading(true);
        setWikiContent(''); // Reset wiki
        setError(null);

        try {
            // 1. Fetch File Content from GitHub (via Proxy)
            const res = await fetch(`/api/github?endpoint=repos/${repo}/contents/${file.path}`);
            const data = await res.json();

            // Handle large files or errors
            if (data.message || !data.content) {
                throw new Error(data.message || 'Unable to read file content');
            }

            // GitHub returns base64
            // Fix newlines and decode
            const content = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
            setFileContent(content);
            setContentLoading(false);

            // 2. Generate Wiki with Gemini
            setWikiLoading(true);
            setActiveTab('wiki');

            const callAnalyze = async () => {
                const aiRes = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        repo,
                        filename: file.path,
                        code: content
                    })
                });

                const aiData = await aiRes.json();

                if (aiRes.status === 403) {
                    setWikiContent(`# Free Usage Limit Reached 🚀\n\nYou have used your one-time free analysis.\n\n[**Sign Up / Log In**](/signup) to continue analyzing repositories unlimitedly.`);
                    return;
                }

                if (aiRes.status === 429) {
                    const waitTime = aiData.retryAfter || 60;
                    let countdown = waitTime;

                    // Start countdown loop
                    setWikiContent(`**Rate Limit Hit**: Free tier quota exceeded.\n\nAutomatic retry in **${countdown}s**...`);

                    const timer = setInterval(() => {
                        countdown -= 1;
                        if (countdown <= 0) {
                            clearInterval(timer);
                            setWikiContent('Retrying generation...');
                            callAnalyze(); // Recursive retry
                        } else {
                            setWikiContent(`**Rate Limit Hit**: Free tier quota exceeded.\n\nAutomatic retry in **${countdown}s**...`);
                        }
                    }, 1000);

                    return; // Don't process this response further, wait for retry
                }

                if (!aiRes.ok) {
                    setWikiContent(`**Error generating analysis**: ${aiData.error || 'Unknown error'}. \n\n Please ensure you have set a valid \`GOOGLE_AI_API_KEY\` in your \`.env.local\` file.`);
                } else {
                    setWikiContent(aiData.result);
                }
            };

            await callAnalyze();

        } catch (e: any) {
            console.error(e);
            setFileContent(`Error loading file: ${e.message}`);
            setWikiContent('');
        } finally {
            setContentLoading(false);
            if (!wikiContent.includes('Automatic retry')) {
                setWikiLoading(false);
            }
        }
    }

    async function handleSendMessage() {
        if (!chatInput.trim() || chatLoading) return;

        const newUserMsg = { role: 'user' as const, content: chatInput };
        const newMessages = [...chatMessages, newUserMsg];

        setChatMessages(newMessages);
        setChatInput('');
        setChatLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages,
                    context: fileContent // Pass current file content as context
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send message');
            }

            setChatMessages([...newMessages, { role: 'assistant', content: data.result }]);

        } catch (err: any) {
            console.error(err);
            setChatMessages([...newMessages, { role: 'assistant', content: 'Error: ' + err.message }]);
        } finally {
            setChatLoading(false);
        }
    }

    // Sidebar Resizing State
    const [sidebarWidth, setSidebarWidth] = useState(250);
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            setSidebarWidth(e.clientX); // Simple resizing logic (assuming sidebar is on left)
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    return (
        <div className="flex flex-row h-full overflow-hidden w-full items-stretch">
            {/* Sidebar (Explorer) */}
            <aside
                className="shrink-0 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col relative group"
                style={{ width: sidebarWidth, minWidth: '150px', maxWidth: '600px' }}
            >
                {/* Drag Handle */}
                <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[var(--primary)] transition-colors z-10"
                    onMouseDown={() => setIsResizing(true)}
                />

                <div className="px-4 py-3 border-b border-[var(--border)] select-none">
                    <h2 className="text-xs font-bold text-[var(--secondary)] uppercase tracking-wider">Explorer</h2>
                    <p className="text-xs text-[var(--secondary)] truncate mt-1" title={repo || ''}>
                        {repo?.replace(/^(https?:\/\/)?(www\.)?github\.com\//, '').replace(/\/$/, '')}
                    </p>
                </div>

                {error && (
                    <div className="p-4 m-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs shadow-sm">
                        <div className="flex items-center gap-2 mb-1 font-semibold"><AlertCircle size={14} /> Error</div>
                        {error}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                    {fileTree.length === 0 && !error ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[var(--secondary)]" /></div>
                    ) : (
                        <FileTree
                            nodes={fileTree}
                            repo={repo!}
                            onFileClick={handleFileClick}
                            fetchChildren={(path) => fetchRepoContents(repo!, path)}
                        />
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col bg-[var(--background)] relative min-w-0 min-h-0 overflow-hidden h-full">
                {selectedFile ? (
                    <>
                        <header className="h-14 border-b border-[var(--border)] flex items-center justify-between px-6 bg-[var(--surface)] shrink-0">
                            <div className="flex items-center gap-2 overflow-hidden min-w-0">
                                <FileCode size={18} className="text-[var(--primary)] shrink-0" />
                                <span className="font-semibold truncate">{selectedFile.name}</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <div className="flex bg-[var(--background)] p-1 rounded-md border border-[var(--border)] shrink-0 h-12 items-center">
                                    <button
                                        onClick={() => setActiveTab('wiki')}
                                        className={`flex items-center gap-2 px-6 h-full text-base rounded transition-all duration-200 border-2 ${activeTab === 'wiki' ? 'bg-[var(--surface)] text-[var(--primary)] border-[var(--primary)] font-bold shadow-sm' : 'bg-transparent text-[var(--secondary)] border-transparent hover:bg-[var(--surface-hover)]'}`}
                                    >
                                        <Book size={20} /> Wiki
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('code')}
                                        className={`flex items-center gap-2 px-6 h-full text-base rounded transition-all duration-200 border-2 ${activeTab === 'code' ? 'bg-[var(--surface)] text-[var(--primary)] border-[var(--primary)] font-bold shadow-sm' : 'bg-transparent text-[var(--secondary)] border-transparent hover:bg-[var(--surface-hover)]'}`}
                                    >
                                        <Code size={20} /> Code
                                    </button>
                                </div>
                                <button
                                    onClick={() => setIsChatOpen(!isChatOpen)}
                                    className={`p-3 rounded-md transition-colors border border-[var(--border)] ${isChatOpen ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--secondary)]'}`}
                                    title="Toggle Chat"
                                >
                                    <MessageSquare size={22} />
                                </button>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto min-h-0 h-full p-8 custom-scrollbar relative">
                            {contentLoading ? (
                                <div className="h-full flex flex-col items-center justify-center text-[var(--secondary)] gap-4">
                                    <Loader2 className="animate-spin" size={32} />
                                    <span>Fetching file content...</span>
                                </div>
                            ) : activeTab === 'wiki' ? (
                                <div className="max-w-4xl mx-auto">
                                    {wikiLoading ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-[var(--secondary)] animate-pulse">
                                            <div className="h-2 w-32 bg-[var(--surface-hover)] rounded"></div>
                                            <div className="h-2 w-48 bg-[var(--surface-hover)] rounded"></div>
                                            <p className="text-sm"> CodeReviewX is analyzing logic...</p>
                                        </div>
                                    ) : (
                                        <div className="rounded-md overflow-hidden border-2 border-[var(--primary)] bg-[var(--surface)] p-8 shadow-md mb-10 ring-4 ring-[var(--primary)]/5">
                                            <div className="prose max-w-none prose-slate prose-invert">
                                                <ReactMarkdown
                                                    components={{
                                                        code({ node, className, children, ...props }) {
                                                            const match = /language-(\w+)/.exec(className || '');
                                                            if (match && match[1] === 'mermaid') {
                                                                return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                                                            }
                                                            return <code className={className} {...props}>{children}</code>;
                                                        }
                                                    }}
                                                >
                                                    {wikiContent}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-md overflow-hidden border-2 border-[var(--primary)] bg-[#0d1117] max-w-full shadow-lg ring-4 ring-[var(--primary)]/5">
                                    <div className="overflow-x-auto p-4">
                                        <pre className="text-sm font-mono leading-relaxed">
                                            <code>{fileContent}</code>
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[var(--secondary)] gap-4">
                        <div className="w-16 h-16 rounded-full bg-[var(--surface)] flex items-center justify-center mb-2">
                            <FileCode size={32} className="opacity-50" />
                        </div>
                        <p>Select a file from the explorer to generate documentation</p>
                    </div>
                )}
            </main>

            {/* Chat Sidebar (Split Screen) */}
            {isChatOpen && (
                <aside className="w-80 min-w-[320px] max-w-[320px] shrink-0 border-l border-[var(--border)] bg-[var(--surface)] flex flex-col shadow-xl z-20 h-full overflow-hidden">
                    <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface)]">
                        <h2 className="font-semibold flex items-center gap-2 text-lg"><Sparkles size={18} className="text-[var(--primary)]" /> AI Assistant</h2>
                        <button onClick={() => setIsChatOpen(false)} className="text-[var(--secondary)] hover:text-[var(--text)]">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 custom-scrollbar bg-[var(--background)]">
                        {chatMessages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-[var(--secondary)] text-center opacity-60">
                                <MessageSquare size={48} className="mb-2" />
                                <p className="text-sm">Ask questions about <br /> the selected file.</p>
                            </div>
                        ) : (
                            chatMessages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-lg p-3 text-sm ${msg.role === 'user' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-hover)] text-[var(--text)] border border-[var(--border)]'}`}>
                                        <ReactMarkdown
                                            components={{
                                                code({ node, className, children, ...props }) {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    if (match && match[1] === 'mermaid') {
                                                        return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                                                    }
                                                    return <code className={className} {...props}>{children}</code>;
                                                }
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ))
                        )}
                        {chatLoading && (
                            <div className="flex justify-start">
                                <div className="bg-[var(--surface-hover)] p-3 rounded-lg border border-[var(--border)]">
                                    <Loader2 size={16} className="animate-spin text-[var(--secondary)]" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-[var(--border)] bg-[var(--surface)]">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                            className="flex items-center gap-2 bg-[var(--background)] border border-[var(--border)] rounded-md px-3 py-2"
                        >
                            <input
                                type="text"
                                className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-[var(--secondary)]"
                                placeholder="Ask a question..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={!chatInput.trim() || chatLoading}
                                className="text-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                </aside>
            )}
        </div>
    );

}

// -- Recursive File Tree Component --

interface FileTreeProps {
    nodes: FileNode[];
    repo: string;
    onFileClick: (file: FileNode) => void;
    fetchChildren: (path: string) => Promise<FileNode[] | null>;
}

function FileTree({ nodes, repo, onFileClick, fetchChildren }: FileTreeProps) {
    return (
        <div className="flex flex-col">
            {nodes.map(node => (
                <FileTreeItem
                    key={node.path}
                    node={node}
                    repo={repo}
                    onFileClick={onFileClick}
                    fetchChildren={fetchChildren}
                />
            ))}
        </div>
    );
}

function FileTreeItem({ node, repo, onFileClick, fetchChildren }: {
    node: FileNode,
    repo: string,
    onFileClick: (f: FileNode) => void,
    fetchChildren: (path: string) => Promise<FileNode[] | null>
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [children, setChildren] = useState<FileNode[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

    async function handleToggle() {
        if (node.type !== 'dir') return;

        const nextOpen = !isOpen;
        setIsOpen(nextOpen);

        if (nextOpen && !hasFetched) {
            setLoading(true);
            const data = await fetchChildren(node.path);
            if (data) {
                setChildren(data);
                setHasFetched(true);
            }
            setLoading(false);
        }
    }

    return (
        <div className="select-none">
            <div
                className={`flex items-center gap-1.5 px-2 py-[2px] rounded-sm hover:bg-[var(--surface-hover)] cursor-pointer text-[11px] transition-colors ${isOpen ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}
                onClick={() => node.type === 'dir' ? handleToggle() : onFileClick(node)}
                style={{ paddingLeft: '0.4rem' }}
            >
                {node.type === 'dir' && (
                    <span className={`text-[var(--secondary)] transition-transform ${isOpen ? 'rotate-90' : ''}`}>
                        <ChevronRight size={10} />
                    </span>
                )}
                {/* Spacer if not dir */}
                {node.type !== 'dir' && <span className="w-[10px]" />}

                {node.type === 'dir' ? (
                    <Folder size={12} className={isOpen ? "text-amber-400" : "text-amber-400/70"} />
                ) : (
                    <FileCode size={12} className="text-blue-400/70" />
                )}

                <span className="truncate flex-1 tracking-tight">{node.name}</span>
                {loading && <Loader2 size={10} className="animate-spin text-[var(--secondary)]" />}
            </div>

            {isOpen && (
                <div className="pl-2 border-l border-[var(--border)] ml-2">
                    {children.length > 0 ? (
                        <FileTree
                            nodes={children}
                            repo={repo}
                            onFileClick={onFileClick}
                            fetchChildren={fetchChildren}
                        />
                    ) : (
                        !loading && <div className="px-2 py-0.5 text-[10px] text-[var(--secondary)] italic">Empty</div>
                    )}
                </div>
            )}
        </div>
    );
}
