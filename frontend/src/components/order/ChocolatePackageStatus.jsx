import { calculatePackages } from '../../utils/chocolatePackaging';

// The same package-completion note shown while building a box on
// /chocolates (.builder-note classes come from ChocolateList.css, already
// loaded globally) - reused here so the order/cart view gives the same
// guidance once chocolates can be adjusted outside that page too (search
// results, the order page's own +/- steppers).
function ChocolatePackageStatus({ totalQuantity }) {
    if (!totalQuantity) {
        return null;
    }
    const { packages, remaining, needToComplete } = calculatePackages(totalQuantity);

    return (
        <div className='choc-package-status'>
            {packages.length > 0 && (
                <p className='builder-note builder-note-success'>מארזים שנוצרו: {packages.join(', ')}</p>
            )}
            {remaining > 0 ? (
                <p className='builder-note builder-note-pending'>עוד {needToComplete} להשלמת מארז השוקולדים</p>
            ) : (
                packages.length === 0 && <p className='builder-note builder-note-pending'>לא ניתן להתאים לחבילת שוקולדים</p>
            )}
        </div>
    );
}

export default ChocolatePackageStatus;
