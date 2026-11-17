import type { PolicyDocument } from "@/lib/site/policy-document";

// The return policy as the owner delivered it on 2026-11-17 (exported from
// Termly, last updated 2026-11-16), converted to plain data. The text is kept
// exactly as delivered; only the generator's styles and markers were dropped.
// From now on the policy is changed here, not in Termly.
export const returnPolicyEn: PolicyDocument = {
  blocks: [
    { kind: "paragraph", text: [{ text: "Last updated November 16, 2026", strong: true }] },
    { kind: "paragraph", text: ["Thank you for your purchase. We hope you are happy with your purchase. However, if you are not completely satisfied with your purchase for any reason, you may return it to us for a refund, store credit, or an exchange. Please see below for more information on our return policy."] },
    { kind: "heading", level: 2, text: ["RETURNS"] },
    { kind: "paragraph", text: ["All returns must be postmarked within fifteen (15) days of the purchase date. All returned items must be in new and unused condition, with all original tags and labels attached."] },
    { kind: "heading", level: 2, text: ["RETURN PROCESS"] },
    { kind: "paragraph", text: ["To return an item, please email customer service at ", { text: "returns@lockmx.com", href: "mailto:returns@lockmx.com" }, " to obtain an Return Merchandise Authorization (RMA) number. After receiving an RMA number, place the item securely in its original packaging, and mail your return to the following address:"] },
    { kind: "paragraph", text: ["LockMX Modular System"] },
    { kind: "paragraph", text: ["Attn: Returns"] },
    { kind: "paragraph", text: ["RMA #"] },
    { kind: "paragraph", text: ["Bairro Resid. da BA11 Bloco A9 2 Esq"] },
    { kind: "paragraph", text: ["Beja, Beja 7800-399"] },
    { kind: "paragraph", text: ["Portugal"] },
    { kind: "paragraph", text: ["Please note, you will be responsible for all return shipping charges. We strongly recommend that you use a trackable method to mail your return."] },
    { kind: "heading", level: 2, text: ["REFUNDS"] },
    { kind: "paragraph", text: ["After receiving your return and inspecting the condition of your item, we will process your return or exchange. Please allow at least eight (8) days from the receipt of your item to process your return or exchange. Refunds may take 1-2 billing cycles to appear on your credit card statement, depending on your credit card company. We will notify you by email when your return has been processed."] },
    { kind: "heading", level: 2, text: ["EXCEPTIONS"] },
    { kind: "paragraph", text: ["For defective or damaged products, please contact us at the contact details below to arrange a refund or exchange."] },
    { kind: "heading", level: 2, text: ["QUESTIONS"] },
    { kind: "paragraph", text: ["If you have any questions concerning our return policy, please contact us at:"] },
    { kind: "paragraph", text: [{ text: "returns@lockmx.com", href: "mailto:returns@lockmx.com" }] },
    { kind: "paragraph", text: ["This Return Policy was created using Termly's ", { text: "Return and Refund Policy Generator", href: "https://termly.io/products/refund-return-policy-generator/" }] },
  ],
};
