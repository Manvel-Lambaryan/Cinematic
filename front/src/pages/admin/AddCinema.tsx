import React, { useState } from "react";
import { motion } from "framer-motion";
import { Axios } from "../../config/axios";
import { Armchair, Sofa, Settings2, Check, Box } from "lucide-react";
import { useTranslation } from "react-i18next";

const FrontViewSeat = ({
  type,
  isSelected,
  seatTypes,
}: {
  type?: keyof typeof seatTypes;
  isSelected: boolean;
  seatTypes: any;
}) => {
  const currentType = type ? seatTypes[type] : null;

  return (
    <div className="relative w-12 h-14 flex items-center justify-center transition-all duration-300">
      {isSelected && currentType ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-full h-full flex flex-col items-center justify-center"
        >
          {/* Backrest (2D Front) */}
          <div
            className={`w-[85%] h-[60%] ${currentType.topColor} rounded-t-xl shadow-lg border-b-4 border-black/20 z-10`}
          />

          {/* Seat Base (2D Front) */}
          <div
            className={`w-full h-[30%] ${currentType.color} rounded-b-lg shadow-md relative z-20`}
          >
            {/* Armrests */}
            <div
              className={`absolute -left-1 top-0 w-2 h-full ${currentType.sideColor} rounded-l-md`}
            />
            <div
              className={`absolute -right-1 top-0 w-2 h-full ${currentType.sideColor} rounded-r-md`}
            />
          </div>
        </motion.div>
      ) : (
        /* Դատարկ տեղերը՝ ավելի տեսանելի */
        <div className="w-10 h-10 rounded-xl border-2 border-dashed border-slate-400/30 dark:border-white/10 bg-slate-400/5 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/20 hover:border-red-600 hover:text-red-600 transition-all cursor-pointer">
          <Box size={14} />
        </div>
      )}
    </div>
  );
};

export const AddCinema = () => {
  const { t } = useTranslation();
  const [hallNumber, setHallNumber] = useState("");
  const [selectedType, setSelectedType] = useState<"NORMAL" | "MEDIUM" | "VIP">(
    "NORMAL",
  );
  const [layout, setLayout] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const SEAT_TYPES = {
    NORMAL: {
      label: t("seat_type_normal"),
      color: "bg-[#334155]",
      topColor: "bg-[#475569]",
      sideColor: "bg-[#1e293b]",
      priceMul: 1,
    },
    MEDIUM: {
      label: t("seat_type_medium"),
      color: "bg-[#991b1b]",
      topColor: "bg-[#b91c1c]",
      sideColor: "bg-[#7f1d1d]",
      priceMul: 1.5,
    },
    VIP: {
      label: t("seat_type_vip"),
      color: "bg-[#92400e]",
      topColor: "bg-[#b45309]",
      sideColor: "bg-[#78350f]",
      priceMul: 2.5,
    },
  };

  const rows = 10;
  const cols = 12;

  const toggleSeat = (r: number, c: number) => {
    const key = `${r}-${c}`;
    const newLayout = { ...layout };
    if (newLayout[key]) delete newLayout[key];
    else
      newLayout[key] = {
        row: r,
        col: c,
        type: selectedType,
        price: 2000 * SEAT_TYPES[selectedType].priceMul,
      };
    setLayout(newLayout);
  };

  const handleSave = async () => {
    if (!hallNumber) return alert(t("enter_hall_number_prompt"));
    setLoading(true);
    try {
      const seatsArray = Object.values(layout).map((seat, index) => ({
        numbering: index + 1,
        price: Number(seat.price),
        types: seat.type,
        status: "available",
        x: seat.col,
        y: seat.row,
      }));
      await Axios.post("/cinema/create", {
        numbering: Number(hallNumber),
        customSeats: seatsArray,
      });
      alert(t("cinema_hall_saved"));
      setLayout({});
    } catch (e) {
      alert(t("error_saving"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[var(--background)] text-slate-900 dark:text-white p-8 font-sans transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <div className="w-full lg:w-[350px]">
          <div className="p-8 bg-white dark:bg-slate-900/50 backdrop-blur-2xl rounded-[35px] border border-slate-200 dark:border-white/10 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <Settings2 className="text-red-600" />
              <h2 className="text-lg font-bold uppercase tracking-tighter">
                {t("hall_architect")}
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 ml-2">
                  {t("hall_number")}
                </label>
                <input
                  type="number"
                  value={hallNumber}
                  onChange={(e) => setHallNumber(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/40 p-4 rounded-2xl outline-none border border-slate-200 dark:border-white/5 focus:border-red-600 transition-all font-bold dark:text-white"
                  placeholder={t("hall_number_example")}
                />
              </div>

              <div className="space-y-3">
                {(Object.keys(SEAT_TYPES) as Array<keyof typeof SEAT_TYPES>).map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`w-full flex items-center justify-between p-4 rounded-[25px] border-2 transition-all ${
                        selectedType === type
                          ? "border-red-600 bg-red-600/5"
                          : "border-transparent bg-slate-50 dark:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-md ${SEAT_TYPES[type].color}`}
                        />
                        <span className="text-xs font-bold uppercase tracking-wide">
                          {SEAT_TYPES[type].label}
                        </span>
                      </div>
                      {selectedType === type && (
                        <Check size={16} className="text-red-600" />
                      )}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full py-5 rounded-[25px] bg-red-600 text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
              >
                {loading ? t("constructing") : t("save_hall")}
              </button>
            </div>
          </div>
        </div>

        {/* Canvas (Seating Area) */}
        <div className="flex-1 bg-white/50 dark:bg-black/20 rounded-[50px] p-12 border border-slate-200 dark:border-white/5 relative shadow-inner">
          {/* Screen Area */}
          <div className="w-full max-w-xl mx-auto mb-16">
            <div className="h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] rounded-full" />
            <p className="text-center mt-4 text-[9px] font-bold uppercase tracking-[1.5em] text-blue-500/40">
              {t("screen")}
            </p>
          </div>

          {/* Grid */}
          <div className="w-full flex justify-center">
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: rows }).map((_, r) =>
                Array.from({ length: cols }).map((_, c) => {
                  const key = `${r}-${c}`;
                  const seat = layout[key];
                  return (
                    <div key={key} onClick={() => toggleSeat(r, c)}>
                      <FrontViewSeat
                        type={seat?.type}
                        isSelected={!!seat}
                        seatTypes={SEAT_TYPES}
                      />
                    </div>
                  );
                }),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
