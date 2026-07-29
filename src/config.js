// ---------------------------------------------------------------------------
// Where your orders get emailed
// ---------------------------------------------------------------------------
// One-time setup, takes about a minute:
//
//   1. Go to https://web3forms.com
//   2. Type in  indianamhertz@gmail.com  (use the Gmail address — orders are
//      emailed to whichever address you enter here, so don't use an iCloud/Mac
//      Mail address unless you want them going there)
//   3. They email you an "access key" that looks like
//      a1b2c3d4-1234-5678-9abc-def012345678
//   4. Paste it between the quotes below, then save this file
//   5. Publish it:   npm run build   then commit and push
//
// Until the key is filled in, orders are NOT emailed to you — the Manage page
// will show a red warning so you know. It's free for 250 orders a month.
//
// This key is safe to have in the code; Web3Forms keys are meant for public
// web pages and can only send mail to your own registered address.

export const WEB3FORMS_KEY = "";

// Shown to customers on the order confirmation.
export const OWNER_NAME = "Indiana";
