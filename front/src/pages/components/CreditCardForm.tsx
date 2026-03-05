import { AnimatePresence, motion } from "framer-motion";
import {
  type ChangeEvent,
  useMemo,
  useState,
} from "react";
import { Card } from "./Card";
import { CARD_CONFIG, INPUT_CONFIG, type State } from "../../types/type";
import { formatCVC, formatCreditCardNumber, formatExpirationDate } from "../../utils/utils";
import { Axios } from "../../config/axios";
import { toast } from "react-hot-toast";
import { MoveRight } from "lucide-react";

interface Props {
  onSuccess: () => void;
}

export const CreditCardForm = ({ onSuccess }: Props) => {
  const [state, setState] = useState<State>({
    issuer: "",
    cvc: "",
    expiry: "",
    name: "",
    number: "",
  });
  const [depositAmount, setDepositAmount] = useState("");
  const [isCvcFocused, setIsCvcFocused] = useState(false);

  const handleInputChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = evt.target;
    let formattedValue = value;
    if (name === "number") {
      formattedValue = formatCreditCardNumber(value);
    } else if (name === "expiry") {
      formattedValue = formatExpirationDate(value);
    } else if (name === "cvc") {
      formattedValue = formatCVC(value);
    }
    setState((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleCallback = (type: string, isValid: boolean) => {
    if (type === "cvc") {
      setIsCvcFocused(isValid);
    }
  };

  const validateCardDetails = () => {
    if (state.number.replace(/\s/g, "").length !== 16) {
      toast.error("Card number must be 16 digits.");
      return false;
    }
    const [month, year] = state.expiry.split("/");
    if (!month || !year) {
      toast.error("Invalid expiry date.");
      return false;
    }
    const expiryDate = new Date(Number(`20${year}`), Number(month) - 1);
    if (expiryDate < new Date()) {
      toast.error("Card has expired.");
      return false;
    }
    return true;
  };

  const handleDeposit = async () => {
    if (!validateCardDetails()) return;
    if (!depositAmount || Number(depositAmount) <= 0)
      return toast.error("Please enter a valid amount");

    try {
      // Simulate external API call
      await Axios.post("https://jsonplaceholder.typicode.com/posts", {
        cardDetails: state,
        amount: depositAmount,
      });

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await Axios.post("/payments/deposit", {
        amount: Number(depositAmount),
      });

      if (res.data.success) {
        user.balance = res.data.newBalance;
        localStorage.setItem("user", JSON.stringify(user));
        toast.success("Account topped up successfully!");
        window.dispatchEvent(new Event("storage"));
        onSuccess();
      }
    } catch (err) {
      toast.error("Top-up failed. Please try again.");
    }
  };

  const formInputs = useMemo(() => {
    return INPUT_CONFIG.map(
      ({ id, name, placeholder, pattern, type, maxLength }) => {
        return (
          <div key={name} className="mb-4">
            <input
              type={type}
              id={id}
              name={name}
              placeholder={placeholder}
              pattern={pattern}
              required
              value={state[name]}
              onChange={handleInputChange}
              onFocus={() => handleCallback(name, true)}
              onBlur={() => handleCallback(name, false)}
              maxLength={maxLength}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-red-600 transition-colors font-semibold"
            />
          </div>
        );
      },
    );
  }, [state]);

  return (
    <div className="flex flex-col items-center">
      <Card
        cvc={state.cvc}
        expiry={state.expiry}
        name={state.name}
        number={state.number}
        isCvcFocused={isCvcFocused}
      />
      <AnimatePresence>
        <form className="w-full mt-8">
          {formInputs}
          <div className="mb-4">
            <input
              type="number"
              placeholder="Amount (AMD)"
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-red-600 transition-colors font-semibold"
            />
          </div>
        </form>
      </AnimatePresence>
      <button
        onClick={handleDeposit}
        className="w-full bg-red-600 py-5 rounded-[24px] font-black uppercase tracking-[3px] italic hover:bg-red-700 transition-all shadow-xl shadow-red-900/40 flex items-center justify-center gap-3 mt-8"
      >
        Confirm Deposit <MoveRight size={20} />
      </button>
    </div>
  );
};
