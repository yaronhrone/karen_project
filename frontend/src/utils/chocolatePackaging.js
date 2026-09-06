// Chocolates (unlike cakes/cookies) are only sold in these fixed box sizes -
// a physical packaging constraint, not a pricing one. Extracted from
// ChocolateList.jsx (the package-builder there was the original, only place
// this logic lived) so the order/cart views can show the same
// package-completion status without duplicating - and risking drifting from
// - the math that already gates "שלח הזמנה" on the products page.
export const PACKAGE_SIZES = [30, 22, 12, 9, 6, 5];

export function calculateOptimalCompletion(total) {
    const possiblePackages = PACKAGE_SIZES.slice().sort((a, b) => a - b).filter(size => size >= total);

    if (possiblePackages.length === 0) {
        return 0;
    }

    const closestPackage = possiblePackages[0];
    return closestPackage - total;
}

export function calculatePackages(total) {
    let remaining = total;
    const packages = [];
    for (let size of PACKAGE_SIZES) {
        while (remaining >= size) {
            packages.push(size);
            remaining -= size;
        }
    }
    let needToComplete = 0;

    if (remaining > 0) {
        const possiblePackages = PACKAGE_SIZES.filter(s => s > remaining);
        if (possiblePackages.length > 0) {
            needToComplete = Math.min(...possiblePackages) - remaining;
        } else {
            needToComplete = 0;
        }
        if (calculateOptimalCompletion(total) < needToComplete) {
            needToComplete = calculateOptimalCompletion(total);
        }
    }

    return { packages, remaining, needToComplete };
}
