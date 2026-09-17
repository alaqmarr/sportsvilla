const fs = require('fs');
let content = fs.readFileSync('src/components/play/ReviewPanel.tsx', 'utf8');

// Replace Calculate Discount
const newDiscountLogic =     // Calculate Discount
    let discount = 0;
    let cashback = 0;
    const selectedCoupon = coupons.find((c: any) => c.code === selectedCouponCode);
    
    if (selectedCoupon) {
      if (selectedCoupon.type === 'CASHBACK') {
        if (selectedCoupon.cashbackPercentage) {
          cashback = (price * selectedCoupon.cashbackPercentage) / 100;
          if (selectedCoupon.maxDiscount && cashback > selectedCoupon.maxDiscount) {
            cashback = selectedCoupon.maxDiscount;
          }
        } else if (selectedCoupon.cashbackAmount) {
          cashback = selectedCoupon.cashbackAmount;
        }
      } else {
        if (selectedCoupon.discountPercentage) {
          discount = (price * selectedCoupon.discountPercentage) / 100;
          if (selectedCoupon.maxDiscount && discount > selectedCoupon.maxDiscount) {
            discount = selectedCoupon.maxDiscount;
          }
        } else if (selectedCoupon.discountAmount) {
          discount = selectedCoupon.discountAmount;
        }
      }
    };
content = content.replace(/\/\/ Calculate Discount[\s\S]*?const priceAfterDiscount = Math.max\(0, price - discount\);/, newDiscountLogic + '\n\n    const priceAfterDiscount = Math.max(0, price - discount);');

// Replace Coupon List UI
const couponListUI =                 <p className="font-bold text-[var(--play-text)]">
                  {coupon.type === 'CASHBACK'
                    ? (coupon.cashbackPercentage ? \\% CASHBACK\ : \₹\ CASHBACK\)
                    : (coupon.discountPercentage ? \\% OFF\ : \₹\ OFF\)}
                </p>
                {coupon.maxDiscount && <p className="text-xs text-[var(--play-text-muted)] mt-1">Up to ₹{coupon.maxDiscount}</p>}
                {coupon.rewardCouponId && <p className="text-xs text-emerald-500 font-medium mt-1">🎁 Unlocks a reward coupon</p>}
                {coupon.validSportIds && <p className="text-xs text-amber-500 font-medium mt-1">🎯 Valid on selected games</p>}
;
content = content.replace(/                <p className="font-bold text-\[var\(--play-text\)\]">\s*\{coupon\.discountPercentage \? \$\{coupon\.discountPercentage\}% OFF : ₹\$\{coupon\.discountAmount\} OFF\}\s*<\/p>\s*\{coupon\.maxDiscount && <p className="text-xs text-\[var\(--play-text-muted\)\] mt-1">Up to ₹\{coupon\.maxDiscount\}<\/p>\}/, couponListUI);

// Replace Applied Coupon Card UI
const appliedCardUI =               <div>
                <span className="font-bold text-[var(--play-text)] block">
                  {selectedCoupon ? \'\' Applied\ : 'View Offers'}
                </span>
                {selectedCoupon ? (
                  <span className={\	ext-sm font-medium \\}>
                    {cashback > 0 ? \Earn ₹\ cashback\ : \You saved ₹\\}
                  </span>
                ) : (
                  <span className="text-sm text-[var(--play-text-muted)]">{coupons.length} offers available</span>
                )}
              </div>;
content = content.replace(/              <div>\s*<span className="font-bold text-\[var\(--play-text\)\] block">\s*\{selectedCoupon \? '\$\{selectedCoupon\.code\}' Applied : 'View Offers'\}\s*<\/span>\s*\{selectedCoupon \? \(\s*<span className="text-sm font-medium text-emerald-500">You saved ₹\{discount\.toFixed\(2\)\}<\/span>\s*\) : \(\s*<span className="text-sm text-\[var\(--play-text-muted\)\]">\{coupons\.length\} offers available<\/span>\s*\)\}\s*<\/div>/, appliedCardUI);

// Replace Bill Summary
const billSummaryUI =             {discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-500 font-medium">
                <span>Offer Discount ({selectedCouponCode})</span>
                <span>- ₹ {discount.toFixed(2)}</span>
              </div>
            )}
            
            {cashback > 0 && (
              <div className="flex justify-between text-sm text-amber-500 font-medium">
                <span>Wallet Cashback ({selectedCouponCode})</span>
                <span>+ ₹ {cashback.toFixed(2)} (After Payment)</span>
              </div>
            )};
content = content.replace(/            \{discount > 0 && \(\s*<div className="flex justify-between text-sm text-emerald-500 font-medium">\s*<span>Offer Discount \(\{selectedCouponCode\}\)<\/span>\s*<span>- ₹ \{discount\.toFixed\(2\)\}<\/span>\s*<\/div>\s*\)\}/, billSummaryUI);

fs.writeFileSync('src/components/play/ReviewPanel.tsx', content);
