import type { PolicyDocument } from "@/lib/site/policy-document";

// The Portuguese (PT-PT) translation of return-policy.en.ts, made on
// 2026-11-17. It follows the English text block by block: a change to one is
// made to the other (a test checks that they keep the same structure).
export const returnPolicyPt: PolicyDocument = {
  blocks: [
    { kind: "paragraph", text: [{ text: "Última atualização: 16 de novembro de 2026", strong: true }] },
    { kind: "paragraph", text: ["Obrigado pela sua compra. Esperamos que esteja satisfeito com a sua compra. No entanto, se por qualquer motivo não ficar totalmente satisfeito com a sua compra, pode devolvê-la para obter um reembolso, crédito em loja ou uma troca. Consulte abaixo mais informações sobre a nossa Política de Devolução."] },
    { kind: "heading", level: 2, text: ["DEVOLUÇÕES"] },
    { kind: "paragraph", text: ["Todas as devoluções têm de ser enviadas, com carimbo dos correios, no prazo de quinze (15) dias a contar da data da compra. Todos os artigos devolvidos têm de estar em estado novo e não utilizado, com todas as etiquetas e rótulos originais anexados."] },
    { kind: "heading", level: 2, text: ["PROCESSO DE DEVOLUÇÃO"] },
    { kind: "paragraph", text: ["Para devolver um artigo, contacte o apoio ao cliente por email, através de ", { text: "returns@lockmx.com", href: "mailto:returns@lockmx.com" }, ", para obter um número de Autorização de Devolução de Mercadoria (RMA). Após receber o número RMA, coloque o artigo com segurança na embalagem original e envie a sua devolução para a seguinte morada:"] },
    { kind: "paragraph", text: ["LockMX Modular System"] },
    { kind: "paragraph", text: ["A/C: Devoluções"] },
    { kind: "paragraph", text: ["N.º RMA"] },
    { kind: "paragraph", text: ["Bairro Resid. da BA11 Bloco A9 2 Esq"] },
    { kind: "paragraph", text: ["Beja, Beja 7800-399"] },
    { kind: "paragraph", text: ["Portugal"] },
    { kind: "paragraph", text: ["Tenha em atenção que será responsável por todas as despesas de envio da devolução. Recomendamos vivamente que utilize um método de envio com rastreio para enviar a sua devolução."] },
    { kind: "heading", level: 2, text: ["REEMBOLSOS"] },
    { kind: "paragraph", text: ["Após receber a sua devolução e verificar o estado do artigo, processaremos a sua devolução ou troca. Por favor, aguarde pelo menos oito (8) dias a contar da receção do artigo para processar a sua devolução ou troca. Os reembolsos podem levar 1 a 2 ciclos de faturação a surgir no extrato do cartão de crédito, consoante a entidade emitente do seu cartão. Notificá-lo-emos por email quando a sua devolução tiver sido processada."] },
    { kind: "heading", level: 2, text: ["EXCEÇÕES"] },
    { kind: "paragraph", text: ["Para produtos com defeito ou danificados, contacte-nos através dos dados de contacto abaixo para combinar um reembolso ou uma troca."] },
    { kind: "heading", level: 2, text: ["PERGUNTAS"] },
    { kind: "paragraph", text: ["Se tiver alguma dúvida sobre a nossa Política de Devolução, contacte-nos em:"] },
    { kind: "paragraph", text: [{ text: "returns@lockmx.com", href: "mailto:returns@lockmx.com" }] },
    { kind: "paragraph", text: ["Esta Política de Devolução foi criada através do ", { text: "Gerador de Política de Devolução e Reembolso da Termly", href: "https://termly.io/products/refund-return-policy-generator/" }] },
  ],
};
