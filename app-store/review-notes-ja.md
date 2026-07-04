# imagegames App Review notes draft

Image Invaders contains two connected game modes: a stage-based shooter and a card battle game.

## How to test

1. Tap START on the Image Invaders title screen.
2. Select any stage. Defeat the boss to receive a card.
3. Tap the reward card to save it to CARD CASE.
4. Swipe the title screen to open Image Card Battle.
5. Select five different owned cards to begin a battle.

Stage 5 is a perspective 3D shooting stage. Drag vertically to move closer to or farther from the boss, drag horizontally to move left or right, and tap to fire.

## In-App Purchase

- Product ID: com.imageworkshub.imagegames.barrier3
- Type: Consumable
- Content: Three barriers that each block one enemy hit
- Entry point: ITEM SHOP icon on the upper-right side of the Image Invaders title screen

The iOS app uses Apple In-App Purchase only. The Stripe payment link used by the separate web version is removed from the iOS application bundle.

If the app closes before fulfillment finishes, it checks unfinished StoreKit transactions on the next launch, grants the barriers once, and then finishes the transaction.

## Online and comments

The Stage 4 comment field stores text only on the user's device. It is not uploaded or shared and is not user-generated content distributed to other users.

Online card battle uses a short room code and PeerJS/WebRTC to exchange card selections and battle state. There is no text, voice, image, or video chat. Online battles do not transfer cards between users.

## Account

No account or login is required.
