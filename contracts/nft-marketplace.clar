;; sBTC Bazaar NFT Marketplace Contract
;; Basic NFT minting and trading with sBTC collateral

;; Define the NFT
(define-non-fungible-token sbtc-nft uint)

;; Data variables
(define-data-var last-token-id uint u0)

;; Maps
(define-map token-collateral uint uint)
(define-map token-listings uint {price: uint, seller: principal})

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-token-not-found (err u102))
(define-constant err-insufficient-collateral (err u103))

;; Helper functions
(define-read-only (get-last-token-id)
    (var-get last-token-id)
)

(define-read-only (get-token-collateral (token-id uint))
    (map-get? token-collateral token-id)
)

;; Basic mint function (will be enhanced with sBTC integration)
(define-public (mint-nft (collateral-amount uint))
    (let ((token-id (+ (var-get last-token-id) u1)))
        (asserts! (> collateral-amount u0) err-insufficient-collateral)
        (try! (nft-mint? sbtc-nft token-id tx-sender))
        (map-set token-collateral token-id collateral-amount)
        (var-set last-token-id token-id)
        (ok token-id)
    )
)

;; Basic transfer function
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
    (begin
        (asserts! (is-eq tx-sender sender) err-not-token-owner)
        (nft-transfer? sbtc-nft token-id sender recipient)
    )
)