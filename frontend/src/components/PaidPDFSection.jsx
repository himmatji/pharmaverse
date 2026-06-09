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
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
              <p className="text-gray-600 text-sm line-clamp-2">{pdf.description}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Clock size={12} /> Semester {pdf.semester}</span>
                <span className="flex items-center gap-1"><Eye size={12} /> {pdf.views || 0} views</span>
              </div>
            </div>
          }
        >
          {/* Full content after payment */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{pdf.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{pdf.description}</p>
              <button 
                onClick={() => window.open(`http://localhost:5000/api/admin/download/paid-pdf/${pdf._id}`, '_blank')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <Download size={18} />
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