import './ChocolateLoader.css';

// Shared loading indicator, used everywhere the site used to show a plain
// "Loading..." (navbar auth check on every page, admin role check) - a small
// chocolate bar that gets "eaten" square by square in a loop, in the site's
// own brand colors. `label` is optional so call sites can tailor the caption
// without duplicating the animation markup.
function ChocolateLoader({ label = 'רגע אחד…' }) {
    return (
        <div className="chocolate-loader" role="status" aria-label={label}>
            <div className="chocolate-loader-bar">
                {[0, 1, 2, 3, 4].map(i => (
                    <span key={i} className="chocolate-loader-square" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
            </div>
            {label && <span className="chocolate-loader-label">{label}</span>}
        </div>
    );
}

export default ChocolateLoader;
