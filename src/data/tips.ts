import { Tip } from '../types';

export const TIPS: Tip[] = [
  {
    id: '1',
    slug: 'how-to-read-whatsapp-messages-without-blue-tick',
    title: "How to Read WhatsApp Messages Without 'Blue Tick'",
    excerpt: "Learn how to read your WhatsApp messages privately without letting the sender know you've seen them.",
    category: "Privacy",
    createdAt: "2026-03-25T10:00:00Z",
    author: "LinkShare Team",
    imageUrl: "https://picsum.photos/seed/whatsapp-privacy/800/600",
    content: `
      <p>Ever wanted to read a WhatsApp message without the sender knowing? We've all been there. Sometimes you want to see what someone said but aren't ready to reply yet. Here are the best ways to read messages without triggering those blue ticks.</p>
      
      <h3>1. Turn Off Read Receipts</h3>
      <p>The most official way is to go to <strong>Settings > Privacy</strong> and toggle off <strong>Read Receipts</strong>. Note that this is a two-way street: you won't see blue ticks when others read your messages either.</p>
      
      <h3>2. Use the Notification Shade</h3>
      <p>If the message isn't too long, you can often read the entire thing from your phone's notification center. As long as you don't tap the notification to open the app, the blue tick won't appear.</p>
      
      <h3>3. The Airplane Mode Trick</h3>
      <p>When you receive a message, turn on Airplane Mode, open WhatsApp, read the message, close the app completely (kill the process), and then turn Airplane Mode back off. This prevents the "read" status from being sent to the server immediately.</p>
      
      <h3>4. WhatsApp Widgets (Android Only)</h3>
      <p>Android users can add a WhatsApp widget to their home screen. This widget displays incoming messages in full, allowing you to scroll through and read them without ever opening the app.</p>
    `
  },
  {
    id: '2',
    slug: 'how-to-recover-deleted-whatsapp-messages',
    title: "How to Recover Deleted WhatsApp Messages",
    excerpt: "Accidentally deleted a chat? Here's how you can get your precious WhatsApp messages back.",
    category: "Tutorial",
    createdAt: "2026-03-26T10:00:00Z",
    author: "LinkShare Team",
    imageUrl: "https://picsum.photos/seed/whatsapp-recovery/800/600",
    content: `
      <p>Losing important conversations can be stressful. Fortunately, WhatsApp has built-in backup systems that can help you recover deleted messages if you've set them up beforehand.</p>
      
      <h3>1. Restore from Cloud Backup (Google Drive or iCloud)</h3>
      <p>If you have chat backups enabled, the easiest way is to uninstall and reinstall WhatsApp. During the setup process, it will ask if you want to restore your chat history from the cloud.</p>
      
      <h3>2. Local Backup (Android Only)</h3>
      <p>Android devices store local backups for the last 7 days. You can find these in your phone's internal storage under <strong>WhatsApp > Databases</strong>. You can rename these files to force WhatsApp to restore from a specific date.</p>
      
      <h3>3. Third-Party Recovery Tools</h3>
      <p>There are many software options available that claim to recover deleted data. Use these with caution and only as a last resort, as they often require connecting your phone to a computer and may have privacy implications.</p>
    `
  },
  {
    id: '3',
    slug: '5-hidden-emoji-shortcuts-you-never-knew',
    title: "5 Hidden Emoji Shortcuts You Never Knew",
    excerpt: "Speed up your chatting with these secret emoji shortcuts and formatting tricks.",
    category: "Tips",
    createdAt: "2026-03-27T10:00:00Z",
    author: "LinkShare Team",
    imageUrl: "https://picsum.photos/seed/whatsapp-emoji/800/600",
    content: `
      <p>WhatsApp is more than just text. You can format your messages and find emojis faster using these simple keyboard tricks.</p>
      
      <h3>1. Bold, Italic, and Strikethrough</h3>
      <ul>
        <li><strong>Bold:</strong> Wrap text in asterisks (*text*)</li>
        <li><em>Italic:</em> Wrap text in underscores (_text_)</li>
        <li><del>Strikethrough:</del> Wrap text in tildes (~text~)</li>
      </ul>
      
      <h3>2. Monospace Font</h3>
      <p>Want your text to look like code? Wrap it in three backticks (\`\`\`text\`\`\`).</p>
      
      <h3>3. The Emoji Search</h3>
      <p>Instead of scrolling through hundreds of emojis, tap the emoji icon and then the magnifying glass. Type a keyword like "dog" or "happy" to find exactly what you need instantly.</p>
    `
  },
  {
    id: '4',
    slug: 'secret-whatsapp-codes-to-unlock-hidden-menus',
    title: "Secret WhatsApp Codes to Unlock Hidden Menus",
    excerpt: "Discover hidden diagnostic menus and secret settings using these special dialer codes.",
    category: "Secrets",
    createdAt: "2026-03-28T10:00:00Z",
    author: "LinkShare Team",
    imageUrl: "https://picsum.photos/seed/whatsapp-codes/800/600",
    content: `
      <p>Did you know there are secret codes you can type into your phone's dialer or even within WhatsApp to access hidden information?</p>
      
      <h3>1. Check Your IMEI</h3>
      <p>Type <strong>*#06#</strong> in your phone's dialer to see your device's unique identification number, which is useful if your phone is ever lost or stolen.</p>
      
      <h3>2. WhatsApp Web Status</h3>
      <p>You can check which devices are currently logged into your WhatsApp account by going to <strong>Linked Devices</strong> in the settings. This is crucial for security.</p>
      
      <h3>3. Network Usage Statistics</h3>
      <p>Go to <strong>Settings > Storage and Data > Network Usage</strong> to see exactly how much data WhatsApp is using for calls, media, and messages. You can even reset these statistics to track usage over a specific period.</p>
    `
  },
  {
    id: '5',
    slug: 'how-to-send-blank-messages-or-invisible-names',
    title: "How to Send Blank Messages or Invisible Names",
    excerpt: "Prank your friends or keep your profile clean by sending completely empty messages.",
    category: "Tricks",
    createdAt: "2026-03-29T10:00:00Z",
    author: "LinkShare Team",
    imageUrl: "https://picsum.photos/seed/whatsapp-blank/800/600",
    content: `
      <p>Have you ever seen someone send a message that is completely empty? Or maybe a profile name that is invisible? It's a fun trick that usually requires special Unicode characters that WhatsApp doesn't filter out.</p>
      
      <h3>The Secret to Blank Text</h3>
      <p>Standard spaces won't work—WhatsApp simply trims them. To send a blank message, you need a "Zero Width Space" or a special "Braille Pattern Blank" character.</p>
      
      <div class="bg-[#00a884]/10 p-6 rounded-2xl my-8 border border-[#00a884]/20">
        <h4 class="text-[#00a884] font-bold mb-2">🚀 Pro Tip: Use our Stylish Text Tool</h4>
        <p class="text-sm mb-4">Manually copying and pasting these characters can be a pain. We've built a dedicated tool that does it for you instantly!</p>
        <a href="/tools/stylish-text" class="inline-block bg-[#00a884] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#008f70] transition-colors">
          Try Stylish Text Generator
        </a>
      </div>
      
      <h3>How to Use It</h3>
      <ol>
        <li>Go to our <strong>Stylish Text Generator</strong>.</li>
        <li>Select the "Blank Text" or "Invisible" option.</li>
        <li>Copy the generated invisible character.</li>
        <li>Paste it into your WhatsApp chat or your profile name.</li>
      </ol>
      <p>It's that simple! Your friends will be wondering how you did it.</p>
    `
  },
  {
    id: '6',
    slug: 'how-to-make-whatsapp-stickers-from-any-photo',
    title: "How to Make WhatsApp Stickers from Any Photo",
    excerpt: "Turn your favorite memes and personal photos into custom WhatsApp stickers in seconds.",
    category: "Creative",
    createdAt: "2026-03-30T10:00:00Z",
    author: "LinkShare Team",
    imageUrl: "https://picsum.photos/seed/whatsapp-stickers/800/600",
    content: `
      <p>Custom stickers are the best way to express yourself on WhatsApp. While there are many apps for this, WhatsApp now has a built-in sticker maker for many users.</p>
      
      <h3>1. Using the Built-in Sticker Maker (iOS & Web)</h3>
      <p>On iOS, you can simply drag a photo from your gallery into a WhatsApp chat, and it will offer to convert it into a sticker. On WhatsApp Web, click the '+' icon in a chat and select 'New Sticker'.</p>
      
      <h3>2. Using Third-Party Apps (Android & iOS)</h3>
      <p>Apps like "Sticker.ly" or "Sticker Maker" allow you to remove backgrounds, add text, and create entire sticker packs that you can import directly into WhatsApp.</p>
      
      <h3>3. Tips for Great Stickers</h3>
      <ul>
        <li>Use high-contrast images.</li>
        <li>Remove the background for a cleaner look.</li>
        <li>Add a white border to make the sticker pop on both light and dark modes.</li>
      </ul>
    `
  }
];
