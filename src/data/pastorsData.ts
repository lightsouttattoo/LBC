import { PastorShift } from '../types';

export const BAPTIST_PASTORS: PastorShift[] = [
  {
    id: 'pastor_david',
    name: 'Pastor David Evans',
    role: 'Senior Pastor',
    church: 'Lights Out Baptist Church',
    shiftName: 'Morning Shift',
    shiftHours: '6:00 AM – 2:00 PM',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    bio: 'Serving over 22 years in Baptist ministry with a heart for expository preaching, soul winning, and faithful shepherd care grounded in the Authorized King James Holy Bible.',
    specialty: 'Expository Preaching, Salvation & Doctrine, Spiritual Assurance',
    favoriteVerse: 'Romans 8:28 - "And we know that all things work together for good to them that love God, to them who are the called according to his purpose."',
    greetingMessage: "Grace and peace be unto you! I am Pastor David Evans, Senior Pastor at Lights Out Baptist Church. I am currently on duty on our Morning Shift as your Virtual Faith Assistant. How can I pray for you, study God's Word with you, or offer biblical guidance today?"
  },
  {
    id: 'pastor_thomas',
    name: 'Pastor Thomas Wright',
    role: 'Associate & Intercessory Prayer Pastor',
    church: 'Lights Out Baptist Church',
    shiftName: 'Afternoon Shift',
    shiftHours: '2:00 PM – 10:00 PM',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
    bio: 'Passionate intercessor and associate minister dedicated to standing in the gap for families, the sick, and those seeking spiritual breakthrough through earnest prayer.',
    specialty: 'Fervent Prayer, Healing, Spiritual Breakthrough & Encouragement',
    favoriteVerse: 'James 5:16 - "The effectual fervent prayer of a righteous man availeth much."',
    greetingMessage: "Praise the Lord! Pastor Thomas Wright here, Associate Pastor on duty for our Afternoon Prayer Watch. Whatever heavy burden or request is on your heart today, let us take it to the Lord Jesus Christ together in prayer. What is your petition?"
  },
  {
    id: 'pastor_mark',
    name: 'Pastor Mark Stevenson',
    role: 'Discipleship & Family Pastor',
    church: 'Lights Out Baptist Church',
    shiftName: 'Night Shift',
    shiftHours: '10:00 PM – 6:00 AM',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    bio: 'Dedicated to strengthening Christian homes, marriages, and discipleship walks. Providing late-night pastoral care and peaceful biblical counsel when sleep is hard to find.',
    specialty: 'Marriage & Family Counsel, Discipleship, Late Night Peace & Prayer',
    favoriteVerse: 'Psalm 4:8 - "I will both lay me down in peace, and sleep: for thou, LORD, only makest me dwell in safety."',
    greetingMessage: "God bless you tonight. I am Pastor Mark Stevenson, Discipleship Pastor on duty for the Night Shift watch. If you are seeking late-night spiritual peace, wisdom from God's Word, or earnest prayer before rest, I am right here with you."
  }
];

export function getCurrentOnDutyPastor(selectedPastorId?: string): PastorShift {
  if (selectedPastorId) {
    const found = BAPTIST_PASTORS.find(p => p.id === selectedPastorId);
    if (found) return found;
  }

  const hour = new Date().getHours();
  // Morning: 6 AM to 2 PM (6..13)
  if (hour >= 6 && hour < 14) {
    return BAPTIST_PASTORS[0]; // Pastor David Evans
  }
  // Afternoon: 2 PM to 10 PM (14..21)
  if (hour >= 14 && hour < 22) {
    return BAPTIST_PASTORS[1]; // Pastor Thomas Wright
  }
  // Night: 10 PM to 6 AM (22..23 or 0..5)
  return BAPTIST_PASTORS[2]; // Pastor Mark Stevenson
}

// Fallback intelligent Baptist response engine if backend Gemini key is unreachable or offline
export function generateFallbackBaptistResponse(pastor: PastorShift, userMsg: string): string {
  const text = userMsg.toLowerCase().trim();

  // 1. James Chapter 2 or James specifically
  if (text.includes('james 2') || text.includes('james chapter 2')) {
    return `Yes, absolutely! James Chapter 2 (KJV) is one of the most vital chapters in the New Testament on living faith!

Key passages in James 2:
• **Respect of Persons (James 2:1-9):** James warns: *"My brethren, have not the faith of our Lord Jesus Christ, the Lord of glory, with respect of persons."* True faith treats all believers with equal love, fulfilling the royal law (*"Thou shalt love thy neighbour as thyself"*).
• **Faith Without Works is Dead (James 2:14-26):** Verse 17 declares: *"Even so faith, if it hath not works, is dead, being alone."* True saving faith in Christ (Ephesians 2:8-9) is not mere mental assent; it produces real spiritual fruit and obedience in our daily lives! James gives the example of Abraham offering Isaac and Rahab receiving the spies. Verse 26 concludes: *"For as the body without the spirit is dead, so faith without works is dead also."*

What specific verse in James 2 would you like to unpack further or pray over together?`;
  }

  if (text.includes('james')) {
    return `Praise the Lord! The Epistle of James is packed with practical wisdom for the Christian walk.

• **James 1:** Counting trials as joy (*"the trying of your faith worketh patience"*) and being doers of the Word, not hearers only (v.22).
• **James 2:** Warning against favoritism and declaring that genuine faith produces godly works (*"faith without works is dead"*).
• **James 3:** Taming the tongue and pursuing heavenly wisdom (*"pure, peaceable, gentle, and easy to be intreated"*).
• **James 4:** Submitting to God and resisting the devil (*"Draw nigh to God, and he will draw nigh to you"*).
• **James 5:** Patience in suffering and the power of prayer (*"The effectual fervent prayer of a righteous man availeth much"*).

Which chapter or topic in James is on your heart today?`;
  }

  // 2. Gospel of John & Salvation
  if (text.includes('john 3:16') || text.includes('john 3')) {
    return `Amen! In John 3 (KJV), Jesus teaches Nicodemus: *"Except a man be born again, he cannot see the kingdom of God"* (v.3).

And John 3:16 proclaims the glorious gospel:
*"For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."*

Salvation is a complete work of grace received through faith in Christ Jesus! Have you experienced this new birth in Christ?`;
  }

  if (text.includes('john')) {
    return `The Gospel of John unveils Jesus Christ as the eternal Son of God, the Light and Life of men!

• **John 1:1,14:** *"In the beginning was the Word, and the Word was with God, and the Word was God... And the Word was made flesh, and dwelt among us."*
• **John 14:6:** *"Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me."*

How can I encourage your faith from John's Gospel today?`;
  }

  // 3. Romans & Salvation Doctrine
  if (text.includes('romans')) {
    return `Amen! The Epistle to the Romans is the bedrock of Christian doctrine regarding righteousness by faith.

• **Romans 3:23:** *"For all have sinned, and come short of the glory of God."*
• **Romans 5:8:** *"But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us."*
• **Romans 8:28:** *"And we know that all things work together for good to them that love God..."*
• **Romans 10:9:** *"That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved."*

Is there a specific doctrine or verse in Romans you would like to study together?`;
  }

  // 4. Psalms & Comfort
  if (text.includes('psalm 23') || text.includes('psalms 23')) {
    return `Praise God for Psalm 23 (KJV)!
*"The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul... Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me..."*

Whatever trial you face today, the Good Shepherd is guiding your steps and upholding you!`;
  }

  if (text.includes('psalm') || text.includes('psalms')) {
    return `Amen! The Book of Psalms provides refuge for the soul in every season of life.

Whether it is Psalm 91 (*"He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty"*), Psalm 27 (*"The LORD is my light and my salvation; whom shall I fear?"*), or Psalm 46 (*"God is our refuge and strength, a very present help in trouble"*), God's promises stand firm!

Which Psalm is ministering to your heart today?`;
  }

  // 5. Prayer Requests & Sickness
  if (text.includes('pray') || text.includes('prayer') || text.includes('sick') || text.includes('heal') || text.includes('burden') || text.includes('family') || text.includes('help')) {
    return `Amen! As ${pastor.name}, I stand with you in agreement before the Throne of Grace right now.

Let us pray together:
*"Heavenly Father, Almighty God, we come before Thee in the Holy Name of Lord Jesus Christ. Look down in mercy and power upon this precious believer. Lord, Thou knowest every circumstance, every burden, and every need. Supply grace according to Thy riches in glory, bring divine healing, comfort, and peace that passeth all understanding. In Jesus' Holy Name, Amen."*

Hold fast to Philippians 4:6-7! How else can I uplift you in prayer today?`;
  }

  // 6. Greetings
  if (text === 'hi' || text === 'hello' || text === 'hey' || text === 'greetings' || text.startsWith('hello pastor') || text.startsWith('hi pastor')) {
    return `Grace and peace to you! I am ${pastor.name} (${pastor.role} at ${pastor.church}).

I am glad to fellowship with you! Whether you have a question about the KJV Bible, need pastoral advice, or want to pray together, I am right here for you. What is on your heart today?`;
  }

  // 7. General Fallback for any other inquiry - specific & non-repetitive
  return `Thank you for your message regarding: "${userMsg}".

As ${pastor.name} on duty at ${pastor.church}, I am delighted to discuss this with you from God's Holy Word.

Proverbs 3:5-6 (KJV) reminds us:
*"Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths."*

Could you share a bit more about what you'd like to explore on this topic or how we can apply the Holy Scriptures to this situation together?`;
}
