import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "qrcode";
import toast from "react-hot-toast";
import { 
  CheckIcon, 
  XMarkIcon, 
  TicketIcon,
  UserIcon,
  FilmIcon,
  CalendarIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import { Axios } from "../../config/axios";

interface Ticket {
  _id: string;
  ticketId: string;
  user: {
    name: string;
    email: string;
  };
  movie: {
    title: string;
  };
  cinema: {
    name: string;
  };
  seat: {
    numbering: number;
    types: string;
    x: number;
    y: number;
  };
  price: number;
  status: "active" | "used" | "cancelled";
  qrData: string;
  createdAt: string;
}

export const TicketManagement = () => {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage, setTicketsPerPage] = useState(10);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [ticketsPerPage]);

  const fetchTickets = async () => {
    try {
      const response = await Axios.get("/admin/bookings");
      
      let ticketsArray = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          ticketsArray = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          ticketsArray = response.data.data;
        }
      }
      
      setTickets(ticketsArray);

      if (ticketsArray.length === 0) {
        setQrCodes({});
        return;
      }

      const qrCodePromises = ticketsArray.map(async (ticket: Ticket) => {
        try {
          if (ticket && ticket.qrData && ticket.qrData.trim() !== "") {
            const qrDataUrl = await QRCode.toDataURL(ticket.qrData);
            return { [ticket._id]: qrDataUrl };
          }
          return { [ticket._id]: "" };
        } catch (qrError) {
          console.error(`QR generation failed for ticket ${ticket?._id}:`, qrError);
          return { [ticket._id]: "" };
        }
      });

      const qrCodeResults = await Promise.all(qrCodePromises);
      const qrCodeMap = qrCodeResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      setQrCodes(qrCodeMap);
    } catch (error) {
      toast.error("Failed to load tickets");
      console.error("Error fetching tickets:", error);
      setTickets([]);
      setQrCodes({});
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalPages = Math.ceil(tickets.length / ticketsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const validateTicket = async (ticketId: string) => {
    try {
      await Axios.patch(`/admin/bookings/${ticketId}/validate`);
      toast.success("Ticket validated successfully");
      fetchTickets();
    } catch (error) {
      toast.error("Failed to validate ticket");
      console.error("Error validating ticket:", error);
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen transition-colors duration-700 bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-200"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 border-4 border-t-transparent border-slate-300 dark:border-slate-600 rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <TicketIcon className="w-12 h-12 text-slate-600 dark:text-slate-400" />
          </div>
        </div>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="ml-6 font-bold text-xl"
        >
          Loading tickets...
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring" }}
      className="flex flex-col gap-8 p-6 md:p-10 font-sans transition-colors duration-700 bg-[#f8fafc] dark:bg-[#020617] min-h-screen text-slate-900 dark:text-slate-200"
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8"
      >
        <div className="flex items-center gap-6">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="p-6 bg-white dark:bg-white/[0.03] rounded-[35px] border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-none transition-all duration-700 backdrop-blur-md flex-1"
          >
            <TicketIcon className="w-12 h-12 text-slate-700 dark:text-slate-300" />
          </motion.div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">
              {t("ticket_management")}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
              Manage all cinema tickets
            </p>
          </div>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-4 px-6 py-3 bg-white dark:bg-white/[0.03] rounded-[35px] border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-none transition-all duration-700 backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Live</span>
          </div>
          <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
          <div className="text-center">
            <p className="text-2xl font-bold">{tickets.length}</p>
            <p className="text-xs uppercase tracking-wider">{t("total_tickets")}</p>
          </div>
          <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
          <select
            value={ticketsPerPage}
            onChange={(e) => {
              setCurrentPage(1);
              setTicketsPerPage(Number(e.target.value));
            }}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col md:flex-row gap-6"
      >
        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          className="p-6 bg-white dark:bg-white/[0.03] rounded-[35px] border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-none transition-all duration-700 backdrop-blur-md flex-1"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                <ShieldCheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold">Active</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Ready to enter</p>
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold">
            {tickets.filter(t => t.status === 'active').length}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          className="p-6 bg-white dark:bg-white/[0.03] rounded-[35px] border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-none transition-all duration-700 backdrop-blur-md flex-1"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                <CheckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold">Used</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Already entered</p>
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold">
            {tickets.filter(t => t.status === 'used').length}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          className="p-6 bg-white dark:bg-white/[0.03] rounded-[35px] border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-none transition-all duration-700 backdrop-blur-md flex-1"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
                <XMarkIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-semibold">Cancelled</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Refunded</p>
              </div>
            </div>
          </div>
          <div className="text-3xl font-bold">
            {tickets.filter(t => t.status === 'cancelled').length}
          </div>
        </motion.div>
      </motion.div>

      {/* Ticket Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        {currentTickets.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block p-8 bg-white dark:bg-white/[0.03] rounded-[35px] mb-6 border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-none transition-all duration-700 backdrop-blur-md"
            >
              <TicketIcon className="w-20 h-20 text-slate-400 dark:text-slate-600" />
            </motion.div>
            <h3 className="text-2xl font-bold mt-6">
              {t("no_tickets_found")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mt-4">
              No tickets available at the moment
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row xl:flex-row flex-wrap gap-6">
            {currentTickets.map((ticket, index) => (
              <motion.div
                key={ticket._id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="p-6 bg-white dark:bg-white/[0.03] rounded-[35px] border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-none transition-all duration-700 backdrop-blur-md flex-1 lg:flex-initial lg:basis-[calc(50%-12px)] xl:basis-[calc(33.333%-16px)]"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    ticket.status === 'active' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : ticket.status === 'used'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {ticket.status === 'active' ? 'ACTIVE' : ticket.status === 'used' ? 'USED' : 'CANCELLED'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {ticket.ticketId?.substring(0, 8).toUpperCase()}
                  </div>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {ticket.user?.name || 'Guest User'}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {ticket.user?.email || 'No email'}
                    </p>
                  </div>
                </div>

                {/* Movie Info */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                    <FilmIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold line-clamp-2">
                      {ticket.movie?.title || 'Unknown Movie'}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {ticket.cinema?.name || 'Unknown Cinema'}
                    </p>
                  </div>
                </div>

                {/* Seat Info */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                    <div className="text-center font-bold text-slate-600 dark:text-slate-400">
                      <span className="text-lg">{ticket.seat?.numbering || '-'}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      Row {ticket.seat?.y || '-'}, Seat {ticket.seat?.numbering || '-'}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {ticket.price || 0} ֏ • {ticket.seat?.types || 'NORMAL'} Seat
                    </p>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                    <QrCodeIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Entry QR</h3>
                    {qrCodes[ticket._id] && qrCodes[ticket._id] !== "" ? (
                      <img
                        src={qrCodes[ticket._id]}
                        alt="QR Code"
                        className="w-20 h-20 rounded-lg border-2 border-slate-200 dark:border-slate-700"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                        <QrCodeIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Date & Action */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <div>
                      <p className="font-semibold">
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Show Date
                      </p>
                    </div>
                  </div>
                  
                  {ticket.status === "active" ? (
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => validateTicket(ticket._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      <ShieldCheckIcon className="w-4 h-4" />
                      Validate
                    </motion.button>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      {ticket.status === 'used' ? (
                        <>
                          <CheckIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium text-slate-600 dark:text-slate-400">Entered</span>
                        </>
                      ) : (
                        <>
                          <XMarkIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                          <span className="font-medium text-slate-600 dark:text-slate-400">Refunded</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-700 backdrop-blur-md"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Previous
          </motion.button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <motion.button
                key={pageNumber}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => paginate(pageNumber)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-700 ${
                  currentPage === pageNumber
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300'
                }`}
              >
                {pageNumber}
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-700 backdrop-blur-md"
          >
            Next
            <ChevronRightIcon className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};
