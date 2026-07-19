import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getItemById, claimItem, getClaims, confirmClaim } from '../../services/lostFoundService';
import ClaimDialog from '../../components/lostfound/ClaimDialog';
import {
  BookMarked,
  GraduationCap,
  ShieldCheck,
  HelpCircle,
  ArrowLeft,
  LogOut,
  MapPin,
  Calendar,
  Tag,
  User,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Clock
} from 'lucide-react';

const CATEGORY_LABELS = {
  electronics: 'Electronics',
  books: 'Books',
  clothing: 'Clothing',
  id_cards: 'ID/Cards',
  accessories: 'Accessories',
  other: 'Other',
};

const LostFoundDetailPage = () => {
  const { id } = useParams();
  const { user, token, logoutContext } = useAuth();
  const navigate = useNavigate();

  // State
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isClaimSubmitting, setIsClaimSubmitting] = useState(false);
  const [claimedLocally, setClaimedLocally] = useState(false);
  const [claims, setClaims] = useState([]);
  const [loadingClaims, setLoadingClaims] = useState(false);

  // LocalStorage claim tracking key
  const claimStorageKey = `claimed_${id}_user_${user?.id}`;

  // Role config for Header (matches Browse / Post pages)
  const roleConfigs = {
    student: {
      dashboard: '/student/dashboard',
      badgeClass: 'bg-amber-100 text-amber-700',
      logoBg: 'bg-amber-500',
      LogoIcon: BookMarked,
      badgeLabel: 'Student',
    },
    teacher: {
      dashboard: '/teacher/dashboard',
      badgeClass: 'bg-emerald-100 text-emerald-700',
      logoBg: 'bg-emerald-600',
      LogoIcon: GraduationCap,
      badgeLabel: 'Teacher',
    },
    admin: {
      dashboard: '/admin/dashboard',
      badgeClass: 'bg-indigo-100 text-indigo-700',
      logoBg: 'bg-indigo-600',
      LogoIcon: ShieldCheck,
      badgeLabel: 'Admin',
    },
  };

  const currentRole = user?.role || 'student';
  const config = roleConfigs[currentRole] || {
    dashboard: '/login',
    badgeClass: 'bg-primary-100 text-primary-700',
    logoBg: 'bg-primary-600',
    LogoIcon: HelpCircle,
    badgeLabel: 'User',
  };

  const handleLogout = () => {
    logoutContext();
    navigate('/login');
  };

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getItemById(id, token);
        if (response?.success && response.data) {
          setItem(response.data);
          
          // Check if already claimed locally
          const isClaimed = localStorage.getItem(claimStorageKey) === 'true';
          setClaimedLocally(isClaimed);

          // If current user is reporter, fetch claims
          const isUserReporter = String(response.data.reporterId) === String(user?.id);
          if (isUserReporter) {
            try {
              setLoadingClaims(true);
              const claimsRes = await getClaims(id, token);
              if (claimsRes?.success) {
                setClaims(claimsRes.data || []);
              }
            } catch (claimErr) {
              console.error('Error fetching claims list:', claimErr);
            } finally {
              setLoadingClaims(false);
            }
          }
        } else {
          setError('Item details not found.');
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Error loading item details.');
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchItem();
    }
  }, [id, token, claimStorageKey, user?.id]);

  const handleClaimSubmit = async (message) => {
    try {
      setIsClaimSubmitting(true);
      const response = await claimItem(id, message, token);
      if (response?.success) {
        // Persist locally
        localStorage.setItem(claimStorageKey, 'true');
        setClaimedLocally(true);
        setIsDialogOpen(false);
      } else {
        alert(response?.message || 'Failed to submit claim.');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error submitting claim.');
    } finally {
      setIsClaimSubmitting(false);
    }
  };

  const handleConfirmClaim = async (claimId) => {
    try {
      if (!window.confirm('Are you sure you want to confirm this claim? This will resolve the item and reject all other pending claims.')) {
        return;
      }
      const res = await confirmClaim(id, claimId, token);
      if (res?.success) {
        // Re-fetch item details and claims list
        const itemRes = await getItemById(id, token);
        if (itemRes?.success && itemRes.data) {
          setItem(itemRes.data);
        }
        const claimsRes = await getClaims(id, token);
        if (claimsRes?.success) {
          setClaims(claimsRes.data || []);
        }
      } else {
        alert(res?.message || 'Failed to confirm claim.');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error confirming claim.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">CH</span>
              </div>
              <span className="text-lg font-bold text-gray-900">CampusHive</span>
            </div>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-semibold">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">CH</span>
              </div>
              <span className="text-lg font-bold text-gray-900">CampusHive</span>
            </div>
          </div>
        </header>
        <div className="flex-1 max-w-lg mx-auto flex flex-col items-center justify-center p-8 text-center animate-fade-in">
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl mb-4 border border-red-100">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load item</h2>
          <p className="text-sm text-gray-500 mb-6">{error || 'The requested item details could not be retrieved.'}</p>
          <button
            onClick={() => navigate('/lost-found')}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-sm"
          >
            Back to Lost & Found Hub
          </button>
        </div>
      </div>
    );
  }

  const {
    title,
    type,
    category,
    location,
    itemDate,
    status,
    photoPath,
    reporter,
    reporterId,
  } = item;

  const imageUrl = photoPath ? `http://localhost:5000/${photoPath}` : null;
  const categoryLabel = CATEGORY_LABELS[category] || category || 'Other';
  const LogoIconComponent = config.LogoIcon;

  // Determine Claim States
  const isReporter = String(reporterId) === String(user?.id);
  const isResolvedOrClaimedByOther = (status === 'claimed' || status === 'resolved') && !claimedLocally;
  
  // CTA adaptive label
  const ctaButtonLabel = type === 'lost' ? 'I found this' : 'This is mine';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 ${config.logoBg} rounded-lg flex items-center justify-center`}>
              <LogoIconComponent className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">CampusHive</span>
            <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.badgeClass}`}>
              {config.badgeLabel}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {/* Navigation & Header */}
        <div className="mb-6 flex items-center gap-4 animate-fade-in">
          <button
            onClick={() => navigate('/lost-found')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label="Back to Lost & Found Hub"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
              Item Details
            </h1>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Item ID: #{id}</p>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-slide-up">
          {/* Left Column: Image Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="relative w-full h-80 sm:h-96 md:h-[450px] bg-gray-100 flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover animate-fade-in"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '';
                    e.target.className = 'hidden';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 p-8">
                  <ImageIcon className="w-20 h-20 stroke-[1.0] mb-4 text-gray-300" />
                  <span className="text-sm font-semibold">No Image Provided</span>
                </div>
              )}

              {/* Floating Post Type Badge */}
              <div className="absolute top-4 left-4">
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-md border uppercase ${
                    type === 'lost'
                      ? 'bg-rose-50 text-rose-700 border-rose-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}
                >
                  {type === 'lost' ? 'Lost Item' : 'Found Item'}
                </span>
              </div>

              {/* Floating Status Badge */}
              <div className="absolute top-4 right-4">
                <span
                  className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border shadow-md ${
                    claimedLocally || status === 'claimed'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : status === 'resolved'
                      ? 'bg-gray-100 text-gray-600 border-gray-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {claimedLocally ? 'Claimed' : status}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Metadata & Interaction Card */}
          <div className="lg:col-span-5 space-y-6">
            {/* Info Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
              {/* Category */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg text-xs font-semibold">
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                <span>{categoryLabel}</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-snug">
                {title}
              </h2>

              {/* Location & Date grid */}
              <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-100">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Location
                  </span>
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2">{location}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Date {type === 'lost' ? 'Lost' : 'Found'}
                  </span>
                  <p className="text-sm font-semibold text-gray-800">
                    {new Date(itemDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Description</h4>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {description}
                </p>
              </div>
            </div>

            {/* Reporter Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gray-50 rounded-xl text-gray-500 border border-gray-100">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Reported By</span>
                  <h4 className="text-sm font-bold text-gray-800">{reporter?.name || 'Anonymous User'}</h4>
                </div>
              </div>
              
              <div className="text-[10px] text-right font-medium text-gray-400 flex flex-col items-end">
                <span>Safe System Contact</span>
                <span className="text-[9px] text-amber-600 font-bold">No public contact info</span>
              </div>
            </div>

            {/* Claim Action CTA Container */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 bg-gray-50 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">Claim Action</h3>
              </div>
              <div className="p-5">
                {isReporter ? (
                  // Case 1: Logged-in user is the reporter - manage claims
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Claims Received</span>
                      <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                        {claims.length} {claims.length === 1 ? 'claim' : 'claims'}
                      </span>
                    </div>

                    {loadingClaims ? (
                      <div className="flex justify-center py-4">
                        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : claims.length === 0 ? (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-sm text-gray-500">
                        No claims have been submitted for this item yet.
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                        {claims.map((claim) => (
                          <div
                            key={claim.id}
                            className={`p-3.5 border rounded-xl space-y-2.5 transition-all ${
                              claim.status === 'confirmed'
                                ? 'bg-emerald-50/60 border-emerald-200'
                                : claim.status === 'rejected'
                                ? 'bg-gray-50/50 border-gray-150 opacity-70'
                                : 'bg-white border-gray-200 hover:border-amber-300'
                            }`}
                          >
                            {/* Claimant and Status Badge */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <div className="h-5 w-5 bg-gray-150 rounded-full flex items-center justify-center text-[10px] font-extrabold text-gray-600">
                                  {claim.claimant?.name?.charAt(0) || 'U'}
                                </div>
                                <span className="text-xs font-bold text-gray-900 line-clamp-1">
                                  {claim.claimant?.name || 'Anonymous'}
                                </span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide border ${
                                  claim.status === 'confirmed'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                    : claim.status === 'rejected'
                                    ? 'bg-rose-50 text-rose-700 border-rose-150'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {claim.status}
                              </span>
                            </div>

                            {/* Claims Message */}
                            <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100 leading-relaxed break-words whitespace-pre-wrap">
                              {claim.message}
                            </p>

                            {/* Claims Metadata & Actions */}
                            <div className="flex items-center justify-between text-[10px] text-gray-400">
                              <span>
                                {new Date(claim.createdAt).toLocaleDateString(undefined, {
                                  dateStyle: 'medium',
                                })}
                              </span>
                              
                              {status === 'open' && claim.status === 'pending' && (
                                <button
                                  onClick={() => handleConfirmClaim(claim.id)}
                                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-all shadow-sm"
                                >
                                  Confirm & Resolve
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : claimedLocally ? (
                  // Case 2: Claimed by current user
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm text-amber-800">
                    <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-900 block mb-0.5 font-bold">Claim submitted, waiting for reporter to confirm</span>
                      Your claim request has been sent! The reporter has been notified and will review your verification details.
                    </div>
                  </div>
                ) : isResolvedOrClaimedByOther ? (
                  // Case 3: Resolved/claimed by someone else
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex gap-3 text-sm text-gray-650">
                    <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-gray-800 block mb-0.5">Post Resolved</span>
                      This item is no longer available. It has already been claimed or resolved.
                    </div>
                  </div>
                ) : (
                  // Case 4: Open and claimable
                  <div className="space-y-4">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {type === 'lost'
                        ? 'If you have found this item, let the reporter know by providing details of where/when you found it.'
                        : 'If this item belongs to you, submit a claim request with verifying details so the reporter can confirm.'}
                    </p>
                    <button
                      onClick={() => setIsDialogOpen(true)}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow transition-all duration-200"
                    >
                      {ctaButtonLabel}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Claim Message Dialog Modal */}
      <ClaimDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleClaimSubmit}
        type={type}
        isLoading={isClaimSubmitting}
      />
    </div>
  );
};

export default LostFoundDetailPage;
