import { memo, useRef, useCallback, useEffect } from "react";
import { Send, Smile, X, Sticker } from "lucide-react";
import type { ChatState } from "@/hooks/useChat";

import stickerHello from "@/assets/stickers/hello.png";
import stickerLaugh from "@/assets/stickers/laugh.png";
import stickerLove from "@/assets/stickers/love.png";
import stickerCool from "@/assets/stickers/cool.png";
import stickerSpooky from "@/assets/stickers/spooky.png";
import stickerAngry from "@/assets/stickers/angry.png";
import stickerCry from "@/assets/stickers/cry.png";
import stickerShocked from "@/assets/stickers/shocked.png";
import stickerThink from "@/assets/stickers/think.png";
import stickerThumbsup from "@/assets/stickers/thumbsup.png";
import stickerSleep from "@/assets/stickers/sleep.png";
import stickerDance from "@/assets/stickers/dance.png";

type PickerTab = "emoji" | "sticker";

const stickers = [
  { src: stickerHello, label: "Hello", key: "hello" },
  { src: stickerLaugh, label: "Laugh", key: "laugh" },
  { src: stickerLove, label: "Love", key: "love" },
  { src: stickerCool, label: "Cool", key: "cool" },
  { src: stickerSpooky, label: "Spooky", key: "spooky" },
  { src: stickerAngry, label: "Angry", key: "angry" },
  { src: stickerCry, label: "Cry", key: "cry" },
  { src: stickerShocked, label: "Shocked", key: "shocked" },
  { src: stickerThink, label: "Think", key: "think" },
  { src: stickerThumbsup, label: "Thumbs Up", key: "thumbsup" },
  { src: stickerSleep, label: "Sleep", key: "sleep" },
  { src: stickerDance, label: "Dance", key: "dance" },
];

const emojiCategories = [
  { name: "Smileys", emojis: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🫡","🤐","🤨","😐","😑","😶","🫥","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🥵","🥶","🥴","😵","🤯","🤠","🥳","🥸","😎","🤓","🧐","😕","🫤","😟","🙁","😮","😯","😲","😳","🥺","🥹","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👽","👾","🤖"] },
  { name: "Hearts", emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❤️‍🔥","❤️‍🩹","❣️","💕","💞","💓","💗","💖","💘","💝","💟"] },
  { name: "Hands", emojis: ["👋","🤚","🖐️","✋","🖖","🫱","🫲","🫳","🫴","👌","🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","🫵","👍","👎","✊","👊","🤛","🤜","👏","🙌","🫶","👐","🤲","🤝","🙏"] },
  { name: "Animals", emojis: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄️","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐒","🐔","🐧","🐦","🐤","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🪱","🐛","🦋","🐌","🐞","🐜","🪰","🪲","🐢","🐍","🦎","🦂","🕷️","🦀","🐙","🦑"] },
  { name: "Objects", emojis: ["⚡","🔥","✨","🌟","💫","🌈","☁️","🌙","🎵","🎶","🎸","🎹","🥁","🎮","🕹️","🎯","🎲","🧩","🎭","🎨","🏆","🥇","⚽","🏀","🏈","⚾","🎾","🏐","🎱","💎","👑","🎩","💍","🔮","🧿","🎪","🎠","🎡","🎢","🚀","🛸","🌍","💣","💊","🔔","📱","💻","⌨️","🖥️","📷","📺","🎬"] },
  { name: "Food", emojis: ["🍎","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🥑","🍆","🌶️","🫑","🥒","🥬","🥦","🧄","🧅","🍄","🌽","🥕","🥔","🍞","🥐","🥖","🧀","🍕","🍔","🍟","🌭","🍿","🧂","🥚","🍳","🥞","🧇","🥓","🥩","🍗","🍖","🌮","🌯","🫔","🥙","🧆","🥗","🍝","🍜","🍲","🍛","🍣","🍱","🥟","🍤","🍙","🍚","🍘","🍥","🥠","🥮","🍢","🍡","🍧","🍨","🍦","🥧","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍩","🍪","☕","🍵","🧋","🥤","🍶","🍺","🍻","🥂","🍷","🍸","🍹","🧃"] },
];

type Props = {
  state: ChatState;
  input: string;
  setInput: (v: string) => void;
  pickerOpen: boolean;
  setPickerOpen: (v: boolean) => void;
  pickerTab: PickerTab;
  setPickerTab: (t: PickerTab) => void;
  emojiCategory: number;
  setEmojiCategory: (c: number) => void;
  replyingTo: { id: string; text: string; sender: string; dbId?: string } | null;
  setReplyingTo: (r: null) => void;
  onSend: () => void;
  onSendSticker: (key: string) => void;
  onInputChange: (val: string) => void;
  pickerRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLTextAreaElement>;
};

const ChatInputArea = memo(({ state, input, setInput, pickerOpen, setPickerOpen, pickerTab, setPickerTab, emojiCategory, setEmojiCategory, replyingTo, setReplyingTo, onSend, onSendSticker, onInputChange, pickerRef, inputRef }: Props) => {
  const addEmoji = useCallback((emoji: string) => {
    setInput(input + emoji);
    inputRef.current?.focus();
  }, [input, setInput, inputRef]);

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  }, [input, inputRef]);

  return (
    <div className="shrink-0 border-t border-border relative bg-card">
      {pickerOpen && (
        <div ref={pickerRef} className="absolute bottom-full left-0 right-0 border-t border-border animate-[slideIn_0.2s_ease-out] bg-card">
          <div className="flex border-b border-border">
            <button onClick={() => setPickerTab("emoji")} className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 text-[0.65rem] sm:text-xs font-heading font-bold tracking-wider transition-all ${pickerTab === "emoji" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <Smile className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> EMOJI
            </button>
            <button onClick={() => setPickerTab("sticker")} className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 text-[0.65rem] sm:text-xs font-heading font-bold tracking-wider transition-all ${pickerTab === "sticker" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <Sticker className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${pickerTab === "sticker" ? "opacity-100" : "opacity-60"}`} /> STICKERS
            </button>
          </div>

          <div className={pickerTab === "emoji" ? "block" : "hidden"}>
            <div className="flex gap-1 px-2 sm:px-3 py-1.5 sm:py-2 border-b border-border overflow-x-auto scrollbar-none">
              {emojiCategories.map((cat, idx) => (
                <button key={cat.name} onClick={() => setEmojiCategory(idx)} className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[0.6rem] sm:text-[0.65rem] font-medium whitespace-nowrap transition-all ${emojiCategory === idx ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                  {cat.name}
                </button>
              ))}
            </div>
            <div className="h-44 sm:h-52 overflow-y-auto p-2 sm:p-3 picker-scroll overscroll-contain">
              <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-0.5">
                {emojiCategories[emojiCategory].emojis.map((emoji, idx) => (
                  <button key={idx} onClick={() => addEmoji(emoji)} className="w-9 h-9 flex items-center justify-center text-lg sm:text-xl rounded-lg hover:bg-primary/10 active:bg-primary/20 transition-colors active:scale-90">
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={pickerTab === "sticker" ? "block" : "hidden"}>
            <div className="h-44 sm:h-52 overflow-y-auto p-3 sm:p-4 picker-scroll overscroll-contain">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3">
                {stickers.map((sticker) => (
                  <button key={sticker.key} onClick={() => onSendSticker(sticker.key)} disabled={state !== "connected"} className="flex flex-col items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-xl hover:bg-primary/10 active:bg-primary/20 transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed group">
                    <img src={sticker.src} alt={sticker.label} loading="lazy" decoding="async" className="w-12 h-12 sm:w-14 sm:h-14 object-contain group-hover:scale-110 transition-transform" />
                    <span className="text-[0.55rem] sm:text-[0.6rem] text-muted-foreground font-medium">{sticker.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {replyingTo && (
        <div className="px-3 sm:px-4 pt-2 sm:pt-3 pb-0 flex items-center gap-2 sm:gap-3">
          <div className="flex-1 bg-secondary/50 border-l-2 border-primary/50 rounded-r-lg px-2.5 sm:px-3 py-1.5 sm:py-2">
            <p className="text-[0.6rem] sm:text-[0.65rem] font-semibold text-primary/70">{replyingTo.sender}</p>
            <p className="text-[0.65rem] sm:text-xs text-muted-foreground truncate">{replyingTo.text}</p>
          </div>
          <button onClick={() => setReplyingTo(null)} className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all" aria-label="Cancel reply">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="p-2.5 sm:p-4">
        <div className="flex gap-1.5 sm:gap-2 items-end">
          <button onClick={() => { setPickerOpen(!pickerOpen); setPickerTab("emoji"); }} className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-lg flex items-center justify-center transition-all active:scale-90 ${pickerOpen && pickerTab === "emoji" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`} aria-label="Open emoji picker">
            <Smile className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>
          <button onClick={() => { setPickerOpen(!pickerOpen); setPickerTab("sticker"); }} className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-lg flex items-center justify-center transition-all active:scale-90 ${pickerOpen && pickerTab === "sticker" ? "bg-primary/20" : "hover:bg-secondary/50"}`} aria-label="Open sticker picker">
            <img src={specterMascot} alt="Stickers" className={`w-5 h-5 sm:w-6 sm:h-6 transition-all ${pickerOpen && pickerTab === "sticker" ? "opacity-100 scale-110" : "opacity-70 hover:opacity-100"}`} />
          </button>

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            disabled={state !== "connected"}
            placeholder={state === "connected" ? "Message..." : "Find a stranger to start chatting"}
            className="flex-1 bg-secondary border border-border rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-foreground text-sm outline-none resize-none min-h-[40px] sm:min-h-[42px] max-h-[120px] transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/40 disabled:opacity-40 disabled:cursor-not-allowed"
            rows={1}
          />
          <button
            onClick={onSend}
            disabled={state !== "connected" || !input.trim()}
            className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-lg bg-primary flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed btn-primary-glow"
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
});

ChatInputArea.displayName = "ChatInputArea";
export default ChatInputArea;
