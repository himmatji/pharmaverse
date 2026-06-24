import { useState, useEffect } from 'react';
import axios from 'axios';
import LockedContent from './LockedContent';
import { Download, Eye, Clock } from 'lucide-react';

const PaidPDFSection = () => {
  const [paidPDFs, setPaidPDFs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaidPDFs();
  }, []);

  const fetchPaidPDFs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/public/paid-pdfs');
      setPaidPDFs(response.data);
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8 sm:py-10 md:py-12">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 px-2 sm:px-0">
      {paidPDFs.map((pdf) => (
        <LockedContent
          key={pdf._id}
          product={{
            id: pdf._id,
            title: pdf.title,
            price: pdf.price,
            type: 'paid-pdf'
          }}
          previewContent={
            <div>
              <img 
                src={pdf.thumbnail || '/pdf-placeholder.jpg'} 
                alt={pdf.title}
                className="w-full h-32 sm:h-36 md:h-40 object-cover rounded-lg mb-2 sm:mb-3"
              />
              <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{pdf.description}</p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3 text-[10px] sm:text-xs text-gray-400">
                <span className="flex items-center gap-1"><Clock size={10} className="sm:w-[12px] sm:h-[12px]" /> Semester {pdf.semester}</span>
                <span className="flex items-center gap-1"><Eye size={10} className="sm:w-[12px] sm:h-[12px]" /> {pdf.views || 0} views</span>
              </div>
            </div>
          }
        >
          {/* Full content after payment */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 sm:p-5">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-1 sm:mb-2">{pdf.title}</h3>
              <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">{pdf.description}</p>
              <button 
                onClick={() => window.open(`http://localhost:5000/api/admin/download/paid-pdf/${pdf._id}`, '_blank')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]"
              >
                <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
                Download PDF
              </button>
            </div>
          </div>
        </LockedContent>
      ))}
    </div>
  );
};

export default PaidPDFSection;