import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, Users, Check, X, ChevronLeft, ChevronRight, Sparkles, Filter, Info, CalendarCheck } from 'lucide-react';
import { Event, User } from '../types';
import { MediaInputPicker } from './MediaInputPicker';

interface EventsTabProps {
  user: User;
  events: Event[];
  onCreateEvent: (newEvent: Event) => void;
  onRSVPEvent: (eventId: string, status: 'Going' | 'Interested') => void;
}

const MONTHS = ['August 2026', 'September 2026', 'October 2026'];

export const EventsTab: React.FC<EventsTabProps> = ({
  user,
  events,
  onCreateEvent,
  onRSVPEvent
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEventModal, setSelectedEventModal] = useState<Event | null>(null);
  
  const [monthIndex, setMonthIndex] = useState(0); // 0 = August 2026
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // e.g. '2026-08-05'

  // Form states for Event creation
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-08-15');
  const [time, setTime] = useState('7:00 PM');
  const [location, setLocation] = useState('Church Sanctuary & Online Zoom');
  const [category, setCategory] = useState<'Prayer Meeting' | 'Worship Night' | 'Bible Study' | 'Outreach' | 'Fellowship'>('Prayer Meeting');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=800');
  const [eventVideoUrl, setEventVideoUrl] = useState<string | undefined>(undefined);
  const [eventYoutubeId, setEventYoutubeId] = useState<string | undefined>(undefined);

  const currentMonthName = MONTHS[monthIndex];

  // Month navigation handlers
  const handlePrevMonth = () => {
    setMonthIndex(prev => (prev > 0 ? prev - 1 : MONTHS.length - 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setMonthIndex(prev => (prev < MONTHS.length - 1 ? prev + 1 : 0));
    setSelectedDate(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newEvt: Event = {
      id: `evt_${Date.now()}`,
      title,
      description,
      date,
      time,
      location,
      category,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=800',
      videoUrl: eventVideoUrl,
      youtubeId: eventYoutubeId,
      creatorName: user.name,
      attendeesCount: 1,
      isAttending: 'Going'
    };

    onCreateEvent(newEvt);
    setShowCreateModal(false);
    setTitle('');
    setDescription('');
    setEventVideoUrl(undefined);
    setEventYoutubeId(undefined);
  };

  // Calendar days grid generator
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  // Month code for matching date strings (08, 09, 10)
  const monthCode = monthIndex === 0 ? '08' : monthIndex === 1 ? '09' : '10';

  // Filtered events
  const displayedEvents = selectedDate
    ? events.filter(e => e.date === selectedDate)
    : events;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 pb-24 space-y-6 text-slate-100">
      {/* Header & Create Event CTA */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-purple-500/30 rounded-2xl p-4 sm:p-5 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-400/10 border border-amber-400/30 rounded-xl text-amber-400">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white font-serif">Christian Events & Prayer Calendar</h2>
            <p className="text-xs text-purple-200/70">Click any date to inspect scheduled vigils and prayer services</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 hover:brightness-110 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-1.5 transition-all active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Create Event
        </button>
      </div>

      {/* MONTHLY CALENDAR GRID WIDGET */}
      <div className="bg-slate-900/90 border border-purple-800/40 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
          <h3 className="font-bold font-serif text-sm sm:text-base text-amber-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            {currentMonthName} Schedule
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-purple-900 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-white px-2 py-1 bg-slate-950 rounded-md border border-purple-900/40 min-w-[100px] text-center">
              {currentMonthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-purple-900 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 text-center text-[11px] font-bold text-purple-300">
          <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
          {daysInMonth.map(day => {
            const dayStr = day < 10 ? `0${day}` : `${day}`;
            const formattedDate = `2026-${monthCode}-${dayStr}`;
            const dayEvents = events.filter(e => e.date === formattedDate);
            const hasEvent = dayEvents.length > 0;
            const isToday = monthIndex === 0 && day === 3;
            const isSelected = selectedDate === formattedDate;

            return (
              <button
                key={day}
                onClick={() => {
                  if (isSelected) {
                    setSelectedDate(null); // Toggle off
                  } else {
                    setSelectedDate(formattedDate);
                  }
                }}
                className={`py-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-bold border-amber-300 shadow-lg ring-2 ring-amber-300 scale-105'
                    : isToday 
                      ? 'bg-purple-800 text-amber-300 font-bold border-amber-400/80 shadow-md' 
                      : hasEvent 
                        ? 'bg-purple-950/90 border-purple-500/60 text-amber-300 font-bold hover:bg-purple-900' 
                        : 'bg-slate-950/60 border-purple-900/20 text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <span className="text-xs">{day}</span>
                {hasEvent && (
                  <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-slate-950' : 'bg-amber-400'}`} />
                )}
              </button>
            );
          })}
        </div>

        {selectedDate && (
          <div className="pt-2 border-t border-purple-900/30 flex items-center justify-between text-xs">
            <span className="text-amber-300 font-semibold flex items-center gap-1.5">
              <CalendarCheck className="w-4 h-4 text-amber-400" />
              Showing events for date: <strong className="text-white">{selectedDate}</strong>
            </span>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-purple-300 hover:text-white underline text-[11px]"
            >
              Clear Filter (Show All)
            </button>
          </div>
        )}
      </div>

      {/* EVENTS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            {selectedDate ? `Gatherings on ${selectedDate}` : 'Upcoming Gatherings'} ({displayedEvents.length})
          </h3>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="text-xs text-purple-300 hover:text-amber-300 underline"
            >
              View All {events.length} Gatherings
            </button>
          )}
        </div>

        {displayedEvents.length > 0 ? (
          <div className="space-y-8">
            {(() => {
              const eventSections: { type: 'carousel' | 'vertical'; title: string; items: Event[] }[] = [];
              let eIdx = 0;
              let sIdx = 0;

              while (eIdx < displayedEvents.length) {
                const chunk = displayedEvents.slice(eIdx, eIdx + 3);
                const isCarousel = sIdx % 2 === 0;

                let secTitle = '';
                if (isCarousel) {
                  secTitle = sIdx === 0 ? 'Featured Prayer & Worship Gatherings' : 'Local Ministry Events';
                } else {
                  secTitle = sIdx === 1 ? 'Community Outreach & Bible Study Nights' : 'More Upcoming Events';
                }

                eventSections.push({
                  type: isCarousel ? 'carousel' : 'vertical',
                  title: secTitle,
                  items: chunk
                });

                eIdx += 3;
                sIdx++;
              }

              return eventSections.map((sec, secIndex) => {
                if (sec.type === 'carousel') {
                  return (
                    <div key={`evt_sec_car_${secIndex}`} className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-300 tracking-wider uppercase px-1">
                        <span className="flex items-center gap-1.5 font-serif text-amber-300">
                          <Sparkles className="w-4 h-4 text-amber-400" /> {sec.title}
                        </span>
                        <span className="text-[10px] text-amber-300/80 font-normal">Swipe Horizontally →</span>
                      </div>

                      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
                        {sec.items.map(evt => (
                          <div
                            key={evt.id}
                            onClick={() => setSelectedEventModal(evt)}
                            className="snap-center flex-shrink-0 w-72 sm:w-80 bg-[#0b132b] border border-amber-400/30 hover:border-amber-400/60 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group cursor-pointer"
                          >
                            <div className="relative h-36 overflow-hidden bg-slate-950">
                              <img
                                src={evt.coverImage}
                                alt={evt.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <span className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/30">
                                {evt.category}
                              </span>
                            </div>

                            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                              <div>
                                <h3 className="font-bold text-base text-[#fffbe6] font-serif group-hover:text-amber-300 transition-colors">
                                  {evt.title}
                                </h3>
                                <p className="text-xs text-blue-100/80 line-clamp-2 mt-1 leading-relaxed">
                                  {evt.description}
                                </p>

                                <div className="mt-3 space-y-1 text-xs text-blue-200">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                                    <span>{evt.date} at {evt.time}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                                    <span className="truncate">{evt.location}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-amber-400/20 flex items-center justify-between text-xs">
                                <span className="text-blue-200">{evt.attendeesCount} Attending</span>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRSVPEvent(evt.id, 'Going');
                                  }}
                                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    evt.isAttending === 'Going'
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow'
                                  }`}
                                >
                                  {evt.isAttending === 'Going' ? 'Going ✓' : 'RSVP Going'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={`evt_sec_vert_${secIndex}`} className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-300 tracking-wider uppercase px-1">
                        <span className="font-serif text-amber-300">{sec.title}</span>
                        <span className="text-[10px] text-blue-200 font-normal">{sec.items.length} Events Vertical</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sec.items.map(evt => (
                          <div
                            key={evt.id}
                            onClick={() => setSelectedEventModal(evt)}
                            className="bg-[#0b132b] border border-amber-400/30 hover:border-amber-400/60 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group cursor-pointer"
                          >
                            <div className="relative h-36 overflow-hidden bg-slate-950">
                              <img
                                src={evt.coverImage}
                                alt={evt.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <span className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/30">
                                {evt.category}
                              </span>
                            </div>

                            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                              <div>
                                <h3 className="font-bold text-base text-[#fffbe6] font-serif group-hover:text-amber-300 transition-colors">
                                  {evt.title}
                                </h3>
                                <p className="text-xs text-blue-100/80 line-clamp-2 mt-1 leading-relaxed">
                                  {evt.description}
                                </p>

                                <div className="mt-3 space-y-1 text-xs text-blue-200">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                                    <span>{evt.date} at {evt.time}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                                    <span className="truncate">{evt.location}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-amber-400/20 flex items-center justify-between text-xs">
                                <span className="text-blue-200">{evt.attendeesCount} Believers Attending</span>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRSVPEvent(evt.id, 'Going');
                                  }}
                                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    evt.isAttending === 'Going'
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow'
                                  }`}
                                >
                                  {evt.isAttending === 'Going' ? 'Going ✓' : 'RSVP Going'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
              });
            })()}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-900/80 rounded-2xl border border-purple-900/40 space-y-3">
            <p className="text-sm text-slate-300">No events scheduled on {selectedDate}.</p>
            <button
              onClick={() => setSelectedDate(null)}
              className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
            >
              Show All Gatherings
            </button>
          </div>
        )}
      </div>

      {/* EVENT DETAIL LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto space-y-4"
            >
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
                <span className="bg-amber-400/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/30">
                  {selectedEventModal.category}
                </span>
                <button
                  onClick={() => setSelectedEventModal(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden border border-amber-400/40 bg-slate-950 flex items-center justify-center p-2 max-h-[55vh] shadow-2xl">
                {selectedEventModal.youtubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedEventModal.youtubeId}?autoplay=1`}
                    title={selectedEventModal.title}
                    className="w-full aspect-video rounded-xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : selectedEventModal.videoUrl ? (
                  <video
                    src={selectedEventModal.videoUrl}
                    controls
                    autoPlay
                    className="max-h-[50vh] w-auto max-w-full rounded-xl shadow-lg"
                  />
                ) : (
                  <img
                    src={selectedEventModal.coverImage}
                    alt={selectedEventModal.title}
                    referrerPolicy="no-referrer"
                    className="max-h-[50vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
                  />
                )}
              </div>

              <div>
                <h3 className="font-bold font-serif text-xl text-white">{selectedEventModal.title}</h3>
                <p className="text-xs text-purple-200 mt-1">Organized by {selectedEventModal.creatorName}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-purple-900/40 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-semibold">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>{selectedEventModal.date} at {selectedEventModal.time}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>{selectedEventModal.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>{selectedEventModal.attendeesCount} Believers RSVP'd</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                {selectedEventModal.description}
              </p>

              <div className="pt-3 border-t border-purple-900/40 flex items-center justify-between">
                <button
                  onClick={() => {
                    onRSVPEvent(selectedEventModal.id, 'Interested');
                    setSelectedEventModal(prev => prev ? { ...prev, isAttending: 'Interested' } : null);
                  }}
                  className={`py-2 px-4 rounded-xl text-xs font-bold border transition-all ${
                    selectedEventModal.isAttending === 'Interested'
                      ? 'bg-purple-900 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-purple-800/40 text-slate-300'
                  }`}
                >
                  Interested
                </button>

                <button
                  onClick={() => {
                    onRSVPEvent(selectedEventModal.id, 'Going');
                    setSelectedEventModal(prev => prev ? { ...prev, isAttending: 'Going', attendeesCount: prev.attendeesCount + 1 } : null);
                  }}
                  className={`py-2 px-5 rounded-xl text-xs font-bold shadow transition-all ${
                    selectedEventModal.isAttending === 'Going'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-r from-purple-600 to-amber-500 text-slate-950'
                  }`}
                >
                  {selectedEventModal.isAttending === 'Going' ? 'You are Going ✓' : 'RSVP Going'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE EVENT MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg max-h-[90vh] my-auto bg-[#0b132b] border border-amber-400/40 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100 flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-amber-400/30 pb-3 mb-3 flex-shrink-0">
                <h3 className="font-bold font-serif text-lg text-[#fffbe6]">Schedule Christian Event</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-blue-900/40 transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 overflow-y-auto pr-1.5 flex-1 scrollbar-thin">
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wednesday Vigil / Youth Worship Night..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#081229] border border-amber-400/30 rounded-xl text-xs text-[#fffbe6] focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-amber-300 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#081229] border border-amber-400/30 rounded-xl text-xs text-[#fffbe6] focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-300 mb-1">Time</label>
                    <input
                      type="text"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3 py-2 bg-[#081229] border border-amber-400/30 rounded-xl text-xs text-[#fffbe6] focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">Location / Zoom Link</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Sanctuary / Zoom Link"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#081229] border border-amber-400/30 rounded-xl text-xs text-[#fffbe6] focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[#081229] border border-amber-400/30 rounded-xl text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  >
                    <option value="Prayer Meeting">Prayer Meeting</option>
                    <option value="Worship Night">Worship Night</option>
                    <option value="Bible Study">Bible Study</option>
                    <option value="Outreach">Outreach</option>
                    <option value="Fellowship">Fellowship</option>
                  </select>
                </div>

                <div>
                  <MediaInputPicker
                    label="Event Flyer / Promo Media (Phone Camera, Gallery, Video, YouTube)"
                    value={coverImage}
                    youtubeId={eventYoutubeId}
                    acceptType="both"
                    onChange={(data) => {
                      if (data.mediaUrl) setCoverImage(data.mediaUrl);
                      if (data.videoUrl) setEventVideoUrl(data.videoUrl);
                      if (data.youtubeId) setEventYoutubeId(data.youtubeId);
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Share event details, prayer focus, or what to bring..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#081229] border border-amber-400/30 rounded-xl text-xs text-[#fffbe6] focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Publish Calendar Event
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
