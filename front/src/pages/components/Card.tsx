import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { CARD_CONFIG, CardName } from "../../types/type";
import { getCardType } from "../../utils/utils";
import { Amex, CardIcon, MasterCard, Visa } from "./CustomIcons";

interface Props {
  name: string;
  number: string;
  expiry: string;
  cvc: string;
  isCvcFocused: boolean;
}

export const Card = ({ name, number, expiry, cvc, isCvcFocused }: Props) => {
  // Օպտիմիզացնում ենք քարտի տեսակի որոշումը useMemo-ի միջոցով
  const cardType = useMemo(() => getCardType(number, CARD_CONFIG), [number]);

  const cardLogo = useMemo(() => {
    switch (cardType) {
      case CardName.AMERICAN_EXPRESS:
        return <Amex />;
      case CardName.MASTERCARD:
        return <MasterCard />;
      case CardName.VISA:
        return <Visa />;
      default:
        return <CardIcon />;
    }
  }, [cardType]);

  return (
    <div className="w-80 h-48 relative perspective-1000">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={isCvcFocused ? "back" : "front"}
          initial={{ rotateY: isCvcFocused ? -180 : 180, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: isCvcFocused ? 180 : -180, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {isCvcFocused ? (
            /* BACK OF THE CARD (CVC) */
            <div className="absolute w-full h-full rounded-2xl shadow-2xl p-6 flex flex-col justify-between bg-gradient-to-br from-zinc-800 to-black border border-white/10">
              <div className="w-full h-10 bg-black/80 absolute left-0 top-8" />
              <div className="mt-16 w-full text-right">
                <p className="text-white/60 text-[10px] uppercase font-black tracking-widest mb-1">CVC Code</p>
                <div className="h-10 w-full bg-white rounded-lg flex items-center justify-end pr-4 shadow-inner">
                  <p className="text-black font-mono font-bold tracking-widest italic">{cvc || "•••"}</p>
                </div>
              </div>
              <div className="flex justify-between items-center opacity-20">
                <div className="h-4 w-12 bg-white rounded-sm" />
                <div className="h-4 w-12 bg-white rounded-sm" />
              </div>
            </div>
          ) : (
            /* FRONT OF THE CARD */
            <div className="w-full h-full rounded-2xl shadow-2xl p-6 flex flex-col justify-between bg-gradient-to-br from-red-600 to-red-800 border border-white/20 relative overflow-hidden group">
              {/* Decorative design element */}
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />

              <div className="flex justify-between items-start relative z-10">
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/60 uppercase font-black tracking-[2px]">Bank Card</span>
                  <div className="text-white text-xl font-black italic tracking-tighter uppercase mt-1">
                    {cardType || "Cinematic"}
                  </div>
                </div>
                <div className="drop-shadow-lg">
                  {cardLogo}
                </div>
              </div>

              <div className="text-white text-xl font-mono tracking-[4px] drop-shadow-md py-2 relative z-10">
                {number || "•••• •••• •••• ••••"}
              </div>

              <div className="flex justify-between items-end relative z-10">
                <div className="text-white">
                  <p className="text-[9px] text-white/50 uppercase font-bold tracking-widest">Card Holder</p>
                  <p className="text-sm font-bold tracking-wide uppercase truncate w-40">
                    {name || "Your Name"}
                  </p>
                </div>
                <div className="text-white text-right">
                  <p className="text-[9px] text-white/50 uppercase font-bold tracking-widest">Expires</p>
                  <p className="text-sm font-bold font-mono italic leading-none mt-0.5">
                    {expiry || "MM/YY"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};