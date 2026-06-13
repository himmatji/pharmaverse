import { useState, useEffect } from 'react';
import axios from 'axios';
import LockedContent from './LockedContent';
import { Download, Eye, Clock } from 'lucide-react';

// ========== DYNAMIC BASE URL - Works on both Localhost & EC2 ==========
const EC2_BASE_URL = "http://3.109.121.96:5000";
const LOCAL_BASE_URL = "http://localhost:5000";

// Auto-detect environment
const isProduction = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
const BASE_URL = isProduction ? EC2_BASE_URL : LOCAL_BASE_URL;

console.log(`🌐 PaidPDFSection running in ${isProduction ? "PRODUCTION (EC2)" : "DEVELOPMENT (Localhost)"} mode`);

const API_URL = `${BASE_URL}/api/admin/public`;
const DOWNLOAD_URL = `${BASE_URL}/api/admin/download`;

const PaidPDFSection = () => {
  const [paidPDFs, setPaidPDFs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaidPDFs();
  }, []);

  const fetchPaidPDFs = async () => {
    try {
      const response = await axios.get(`${API_URL}/paid-pdfs`);
      setPaidPDFs(response.data);
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle download for unlocked content
  const handleDownload = (pdfId, token) => {
    const downloadUrl = `${DOWNLOAD_URL}/paid-pdf/${pdfId}?token=${token}`;
    window.open(downloadUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (paidPDFs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No PDFs available yet.</p>
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
            price: pdf.price || 499,
            type: 'paid-pdf'
          }}
          previewContent={
            <div>
              <img 
                src={pdf.thumbnail || '/pdf-placeholder.jpg'} 
                alt={pdf.title}
                className="w-full h-40 object-cover rounded-lg mb-3"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x200?text=PDF+Preview';
                }}
              />
              <p className="text-gray-600 text-sm line-clamp-2">{pdf.description || "Premium study material for pharmacy students."}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> Semester {pdf.semester || 1}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={12} /> {pdf.views || 0} views
                </span>
              </div>
            </div>
          }
        >
          {/* Full content after payment */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{pdf.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{pdf.description || "Premium study material for pharmacy students."}</p>
              
              {/* PDF Preview if available */}
              {pdf.fileUrl && (
                <div className="mb-4">
                  <iframe 
                    src={`${BASE_URL}${pdf.fileUrl}`} 
                    className="w-full h-64 rounded-lg border border-gray-200"
                    title="PDF Preview"
                  />
                </div>
              )}
              
              <button 
                onClick={() => {
                  const token = localStorage.getItem("token") || localStorage.getItem("userToken");
                  if (token) {
                    handleDownload(pdf._id, token);
                  } else {
                    alert("Please login to download");
                  }
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
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