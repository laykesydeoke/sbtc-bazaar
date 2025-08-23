;; sBTC Bazaar NFT Marketplace Contract
;; NFT minting and trading with sBTC collateral

;; Define the NFT
(define-non-fungible-token sbtc-nft uint)

;; Data variables
(define-data-var last-token-id uint u0)
(define-data-var marketplace-fee uint u250) ;; 2.5% fee (250 basis points)

;; Maps
(define-map token-collateral uint uint)
(define-map token-listings uint {price: uint, seller: principal})
(define-map token-metadata uint {name: (string-ascii 64), description: (string-ascii 256), image-uri: (string-ascii 256)})

;; Constants
(define-constant contract-owner tx-sender)
(define-constant min-collateral-amount u1000000) ;; 0.01 sBTC (1M satoshis)
(define-constant sbtc-token 'SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR.Wrapped-Bitcoin) ;; sBTC contract address
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-token-not-found (err u102))
(define-constant err-insufficient-collateral (err u103))
(define-constant err-token-not-listed (err u104))
(define-constant err-insufficient-payment (err u105))
(define-constant err-cannot-buy-own-nft (err u106))

;; Helper functions
(define-read-only (get-last-token-id)
    (var-get last-token-id)
)

(define-read-only (get-token-collateral (token-id uint))
    (map-get? token-collateral token-id)
)

(define-read-only (get-token-listing (token-id uint))
    (map-get? token-listings token-id)
)

(define-read-only (get-token-metadata (token-id uint))
    (map-get? token-metadata token-id)
)

(define-read-only (get-marketplace-fee)
    (var-get marketplace-fee)
)

;; Enhanced mint function with sBTC collateral and metadata
(define-public (mint-nft (collateral-amount uint) (name (string-ascii 64)) (description (string-ascii 256)) (image-uri (string-ascii 256)))
    (let ((token-id (+ (var-get last-token-id) u1)))
        (asserts! (>= collateral-amount min-collateral-amount) err-insufficient-collateral)
        ;; Transfer sBTC collateral to contract (placeholder for now)
        ;; (try! (contract-call? sbtc-token transfer collateral-amount tx-sender (as-contract tx-sender) none))
        (try! (nft-mint? sbtc-nft token-id tx-sender))
        (map-set token-collateral token-id collateral-amount)
        (map-set token-metadata token-id {name: name, description: description, image-uri: image-uri})
        (var-set last-token-id token-id)
        (ok token-id)
    )
)

;; List NFT for sale
(define-public (list-nft (token-id uint) (price uint))
    (let ((owner (unwrap! (nft-get-owner? sbtc-nft token-id) err-token-not-found)))
        (asserts! (is-eq tx-sender owner) err-not-token-owner)
        (asserts! (> price u0) err-insufficient-payment)
        (map-set token-listings token-id {price: price, seller: tx-sender})
        (ok true)
    )
)

;; Buy listed NFT
(define-public (buy-nft (token-id uint))
    (let (
        (listing (unwrap! (map-get? token-listings token-id) err-token-not-listed))
        (price (get price listing))
        (seller (get seller listing))
        (fee (/ (* price (var-get marketplace-fee)) u10000))
        (seller-amount (- price fee))
    )
        (asserts! (not (is-eq tx-sender seller)) err-cannot-buy-own-nft)
        ;; Transfer sBTC payment (placeholder for now)
        ;; (try! (contract-call? sbtc-token transfer seller-amount tx-sender seller none))
        ;; (try! (contract-call? sbtc-token transfer fee tx-sender contract-owner none))
        (try! (nft-transfer? sbtc-nft token-id seller tx-sender))
        (map-delete token-listings token-id)
        (ok true)
    )
)

;; Cancel listing
(define-public (cancel-listing (token-id uint))
    (let ((listing (unwrap! (map-get? token-listings token-id) err-token-not-listed)))
        (asserts! (is-eq tx-sender (get seller listing)) err-not-token-owner)
        (map-delete token-listings token-id)
        (ok true)
    )
)

;; Basic transfer function
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
    (begin
        (asserts! (is-eq tx-sender sender) err-not-token-owner)
        ;; Remove from listings if listed
        (map-delete token-listings token-id)
        (nft-transfer? sbtc-nft token-id sender recipient)
    )
)