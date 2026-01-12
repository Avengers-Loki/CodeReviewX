
export default function Footer() {
    return (
        <footer style={{
            marginTop: '5rem',
            padding: '2rem 1rem',
            borderTop: '1px solid var(--border)',
            width: '100%',
            color: 'var(--secondary)',
            fontSize: '0.875rem'
        }}>
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    © {new Date().getFullYear()} CodeReviewX. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
