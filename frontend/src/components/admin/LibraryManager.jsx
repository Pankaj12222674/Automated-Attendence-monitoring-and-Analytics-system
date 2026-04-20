import React, { useState, useEffect } from "react";
import api from "../../api";

const inputClasses = "w-full rounded-xl bg-slate-800/50 border border-slate-700/50 px-4 py-2.5 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm placeholder-slate-500";
const btnClasses = "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold py-2.5 px-5 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25";

export default function LibraryManager() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "Computer Science",
    type: "Physical",
    totalCopies: 1,
    digitalUrl: "",
    description: "",
  });

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/library");
      setBooks(res.data.data || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch library inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError("");
    try {
      await api.post("/library/add", formData);
      setShowAddModal(false);
      setFormData({
        title: "", author: "", isbn: "", category: "Computer Science",
        type: "Physical", totalCopies: 1, digitalUrl: "", description: ""
      });
      setAdding(false);
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add book");
      setAdding(false);
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-700/30 px-6 py-4">
        <div>
          <h3 className="text-white font-semibold">Library Directory</h3>
          <p className="text-xs text-gray-400 mt-1">Manage physical books and digital e-resources.</p>
        </div>
        <div className="mt-3 md:mt-0">
          <button onClick={() => setShowAddModal(true)} className={btnClasses}>
            + Add New Book
          </button>
        </div>
      </div>

      <div className="p-6 overflow-x-auto">
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {loading ? (
          <p className="text-sm text-slate-400">Loading library...</p>
        ) : books.length === 0 ? (
          <div className="bg-slate-800/30 border border-dashed border-slate-600 rounded-md p-8 text-center text-slate-400 text-sm">
            No books found in the library. Start by adding one!
          </div>
        ) : (
          <table className="min-w-full text-left text-sm text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-800/30 border-b border-slate-700/50">
                <th className="py-3 px-4 font-semibold text-slate-200">Book Details</th>
                <th className="py-3 px-4 font-semibold text-slate-200">Category</th>
                <th className="py-3 px-4 font-semibold text-slate-200">Type</th>
                <th className="py-3 px-4 font-semibold text-slate-200">Availability</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                  <td className="py-3 px-4">
                    <p className="font-medium text-white">{book.title}</p>
                    <p className="text-xs text-gray-400">Author: {book.author}</p>
                    {book.isbn && <p className="text-xs text-gray-400">ISBN: {book.isbn}</p>}
                  </td>
                  <td className="py-3 px-4">{book.category}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      book.type === 'E-Book' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-cyan-400'
                    }`}>
                      {book.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {book.type === 'E-Book' ? (
                      <a href={book.digitalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs">
                        View Digital Copy
                      </a>
                    ) : (
                      <p className="text-sm font-medium">
                        {book.availableCopies} / {book.totalCopies} <span className="text-xs font-normal text-slate-400">Left</span>
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-lg p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Add a New Book</h2>
            <form onSubmit={handleAddBook} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Title *</label>
                  <input required name="title" value={formData.title} onChange={handleInputChange} className={inputClasses} placeholder="Enter book title" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Author *</label>
                  <input required name="author" value={formData.author} onChange={handleInputChange} className={inputClasses} placeholder="Author name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">ISBN</label>
                  <input name="isbn" value={formData.isbn} onChange={handleInputChange} className={inputClasses} placeholder="Optional ISBN" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
                  <select required name="category" value={formData.category} onChange={handleInputChange} className={inputClasses}>
                    {['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Mathematics', 'Physics', 'Management', 'Other'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Type *</label>
                  <select required name="type" value={formData.type} onChange={handleInputChange} className={inputClasses}>
                    <option value="Physical">Physical Book</option>
                    <option value="E-Book">E-Book (Digital)</option>
                  </select>
                </div>

                {formData.type === 'Physical' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Total Copies *</label>
                    <input required type="number" min="1" name="totalCopies" value={formData.totalCopies} onChange={handleInputChange} className={inputClasses} />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Digital Resource URL *</label>
                    <input required name="digitalUrl" type="url" value={formData.digitalUrl} onChange={handleInputChange} className={inputClasses} placeholder="https://cloudinary.com/..." />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} className={inputClasses} rows="3" placeholder="Brief description or synopsis"></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700/30">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-800/40 hover:bg-gray-200 text-slate-200 rounded text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={adding} className={btnClasses}>
                  {adding ? "Saving..." : "Add Book to Directory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}