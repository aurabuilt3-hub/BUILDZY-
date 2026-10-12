import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Professional, Project, Booking, ProjectFeedback } from '../types';
import { MOCK_PROFESSIONALS, MOCK_PROJECTS, MOCK_BOOKINGS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService } from '../services/authService';
import { projectsService } from '../services/projectsService';
import { bookingsService } from '../services/bookingsService';
import { providersService } from '../services/providersService';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  avatar: string;
  projectsCount: number;
  bookingsCount: number;
  role?: 'customer' | 'contractor' | 'worker' | 'admin';
}

export interface DraftProjectPlan {
  title: string;
  type: string;
  builtUpArea: number;
  floorCount: number;
  location: string;
  timelineMonths: number;
  tier: 'Budget-friendly' | 'Balanced' | 'Premium';
  estimatedBudget: number;
  budgetRangeMin: number;
  budgetRangeMax: number;
}

interface AppContextType {
  professionals: Professional[];
  projects: Project[];
  bookings: Booking[];
  compareIds: string[];
  toggleCompare: (proId: string) => void;
  isInCompare: (proId: string) => boolean;
  clearCompare: () => void;
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Booking;
  cancelBooking: (bookingId: string) => void;
  advanceBookingStep: (bookingId: string) => void;
  addProject: (project: Omit<Project, 'id'>) => Project;
  updateTaskStatus: (projectId: string, taskId: string, status: 'Pending' | 'In Progress' | 'Completed') => void;
  updateMilestoneStatus: (projectId: string, milestoneId: string, status: 'Upcoming' | 'In Progress' | 'Completed') => void;
  updateMaterialStatus: (projectId: string, materialId: string, status: 'Requisitioned' | 'Ordered' | 'Delivered' | 'Installed') => void;
  addProjectFeedback: (projectId: string, feedback: Omit<ProjectFeedback, 'id' | 'createdAt'>) => void;
  draftPlan: DraftProjectPlan | null;
  setDraftPlan: (plan: DraftProjectPlan | null) => void;
  selectedTier: 'Budget-friendly' | 'Balanced' | 'Premium';
  setSelectedTier: (tier: 'Budget-friendly' | 'Balanced' | 'Premium') => void;
  toasts: ToastState[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  resetDemoData: () => void;

  // Supabase & Authentication additions
  isSupabaseConfigured: boolean;
  backendMode: 'supabase-connected' | 'demo-showcase';
  isAuthenticated: boolean;
  authLoading: boolean;
  authModalOpen: boolean;
  authModalTab: 'signin' | 'signup';
  openAuthModal: (tab?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, role?: 'customer' | 'contractor') => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  demoSignIn: (role?: 'customer' | 'contractor') => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Distinct keys for demo mode to prevent overwriting demo showcase with private user data
const LS_DEMO_PROJECTS_KEY = 'buildzy_demo_projects_v2';
const LS_DEMO_BOOKINGS_KEY = 'buildzy_demo_bookings_v2';
const LS_COMPARE_KEY = 'buildzy_compare_v2';
const LS_TIER_KEY = 'buildzy_tier_v2';
const LS_DEMO_USER_KEY = 'buildzy_demo_user_v2';
const LS_DRAFT_KEY = 'buildzy_draft_v2';

const DEFAULT_DEMO_USER: UserProfile = {
  name: 'Vikram Malhotra',
  email: 'vikram.malhotra@buildzy.in',
  phone: '+91 98201 55432',
  address: 'Flat 402, Sea Breeze Apts, Bandra West',
  city: 'Mumbai, Maharashtra',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  projectsCount: 2,
  bookingsCount: 3,
  role: 'customer',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [professionals, setProfessionals] = useState<Professional[]>(MOCK_PROFESSIONALS);
  const [backendMode, setBackendMode] = useState<'supabase-connected' | 'demo-showcase'>(
    isSupabaseConfigured ? 'supabase-connected' : 'demo-showcase'
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(isSupabaseConfigured);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');

  // Initialize from LocalStorage or mock data for demo mode
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(LS_DEMO_PROJECTS_KEY);
      return saved ? JSON.parse(saved) : MOCK_PROJECTS;
    } catch {
      return MOCK_PROJECTS;
    }
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem(LS_DEMO_BOOKINGS_KEY);
      return saved ? JSON.parse(saved) : MOCK_BOOKINGS;
    } catch {
      return MOCK_BOOKINGS;
    }
  });

  const [compareIds, setCompareIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LS_COMPARE_KEY);
      return saved ? JSON.parse(saved) : ['pro-1', 'pro-2', 'pro-3'];
    } catch {
      return ['pro-1', 'pro-2', 'pro-3'];
    }
  });

  const [selectedTier, setSelectedTierState] = useState<'Budget-friendly' | 'Balanced' | 'Premium'>(() => {
    try {
      const saved = localStorage.getItem(LS_TIER_KEY);
      if (saved === 'Budget-friendly' || saved === 'Balanced' || saved === 'Premium') {
        return saved;
      }
      return 'Balanced';
    } catch {
      return 'Balanced';
    }
  });

  const [user, setUserState] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(LS_DEMO_USER_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_DEMO_USER;
    } catch {
      return DEFAULT_DEMO_USER;
    }
  });

  const [draftPlan, setDraftPlanState] = useState<DraftProjectPlan | null>(() => {
    try {
      const saved = localStorage.getItem(LS_DRAFT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [toasts, setToasts] = useState<ToastState[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  // Load provider profiles on mount
  useEffect(() => {
    const loadProviders = async () => {
      const result = await providersService.fetchProviders();
      if (result.isLive) {
        setProfessionals(result.data);
      }
    };
    loadProviders();
  }, []);

  // Listen to Supabase Auth State changes if configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          setIsAuthenticated(true);
          setBackendMode('supabase-connected');
          const profileRes = await authService.getProfile(session.user.id);
          if (profileRes.data && mounted) {
            setUserState((prev) => ({
              ...prev,
              ...profileRes.data,
              id: session.user.id,
            }));
          }

          // Fetch live Supabase projects
          const liveProjects = await projectsService.fetchProjects(session.user.id);
          if (liveProjects.data && mounted) {
            setProjects(liveProjects.data);
          }

          // Fetch live Supabase bookings
          const liveBookings = await bookingsService.fetchBookings(session.user.id);
          if (liveBookings.data && mounted) {
            setBookings(liveBookings.data);
          }
        }
      } catch (e) {
        console.warn('Supabase auth initialization check failed:', e);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        setIsAuthenticated(true);
        setBackendMode('supabase-connected');
        showToast(`Signed in as ${session.user.email}`, 'success');

        const profileRes = await authService.getProfile(session.user.id);
        if (profileRes.data && mounted) {
          setUserState((prev) => ({
            ...prev,
            ...profileRes.data,
            id: session.user.id,
          }));
        }

        // Fetch user's live data
        const liveProjects = await projectsService.fetchProjects(session.user.id);
        if (liveProjects.data && mounted) {
          setProjects(liveProjects.data);
        }
        const liveBookings = await bookingsService.fetchBookings(session.user.id);
        if (liveBookings.data && mounted) {
          setBookings(liveBookings.data);
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setBackendMode(isSupabaseConfigured ? 'supabase-connected' : 'demo-showcase');
        // Restore demo data upon signout
        setUserState(DEFAULT_DEMO_USER);
        setProjects(MOCK_PROJECTS);
        setBookings(MOCK_BOOKINGS);
        showToast('Signed out of Buildzy session', 'info');
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sync demo mode changes to LocalStorage ONLY when not authenticated to keep user DB data separate
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        localStorage.setItem(LS_DEMO_PROJECTS_KEY, JSON.stringify(projects));
      } catch (e) {
        console.error(e);
      }
    }
  }, [projects, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      try {
        localStorage.setItem(LS_DEMO_BOOKINGS_KEY, JSON.stringify(bookings));
      } catch (e) {
        console.error(e);
      }
    }
  }, [bookings, isAuthenticated]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_COMPARE_KEY, JSON.stringify(compareIds));
    } catch (e) {
      console.error(e);
    }
  }, [compareIds]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_TIER_KEY, selectedTier);
    } catch (e) {
      console.error(e);
    }
  }, [selectedTier]);

  useEffect(() => {
    if (!isAuthenticated) {
      try {
        localStorage.setItem(LS_DEMO_USER_KEY, JSON.stringify(user));
      } catch (e) {
        console.error(e);
      }
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    try {
      if (draftPlan) {
        localStorage.setItem(LS_DRAFT_KEY, JSON.stringify(draftPlan));
      } else {
        localStorage.removeItem(LS_DRAFT_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [draftPlan]);

  const setSelectedTier = (tier: 'Budget-friendly' | 'Balanced' | 'Premium') => {
    setSelectedTierState(tier);
  };

  const setDraftPlan = (plan: DraftProjectPlan | null) => {
    setDraftPlanState(plan);
  };

  const openAuthModal = (tab: 'signin' | 'signup' = 'signin') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      setIsAuthenticated(true);
      setUserState((prev) => ({
        ...prev,
        email,
        name: email.split('@')[0],
      }));
      showToast(`Signed in to Demo account (${email})`, 'success');
      return { success: true };
    }

    const { data, error } = await authService.signIn(email, password);
    if (error) {
      return { success: false, error };
    }
    return { success: Boolean(data) };
  };

  const signUp = async (
    email: string, 
    password: string, 
    fullName: string, 
    role: 'customer' | 'contractor' = 'customer'
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      setIsAuthenticated(true);
      setUserState((prev) => ({
        ...prev,
        email,
        name: fullName,
        role,
      }));
      showToast(`Welcome to Buildzy, ${fullName}! Account active.`, 'success');
      return { success: true };
    }

    const { data, error } = await authService.signUp(email, password, fullName, role);
    if (error) {
      return { success: false, error };
    }
    showToast('Registration successful! Check email if confirmation is required.', 'success');
    return { success: Boolean(data) };
  };

  const signOut = async () => {
    if (isSupabaseConfigured && isAuthenticated) {
      await authService.signOut();
    }
    setIsAuthenticated(false);
    setUserState(DEFAULT_DEMO_USER);
    setProjects(MOCK_PROJECTS);
    setBookings(MOCK_BOOKINGS);
    showToast('Signed out of session', 'info');
  };

  /**
   * Safe Demo-Account Switching:
   * Explicitly disengages any real Supabase session and clears user.id so
   * the demo persona can NEVER impersonate or write to real database tables!
   */
  const demoSignIn = async (role: 'customer' | 'contractor' = 'customer') => {
    if (isSupabaseConfigured && isAuthenticated) {
      await authService.signOut();
    }

    setIsAuthenticated(false);
    setBackendMode('demo-showcase');

    if (role === 'contractor') {
      setUserState({
        id: undefined, // Explicitly undefined to disallow database sync
        name: 'Marcus Vance',
        email: 'marcus@apexinfra.com',
        phone: '+1 (555) 782-9901',
        address: '88 Builders Plaza, Industrial Way',
        city: 'San Francisco, CA',
        avatar: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=300&auto=format&fit=crop&q=80',
        projectsCount: 14,
        bookingsCount: 22,
        role: 'contractor',
      });
      showToast('Switched to Demo Contractor (Marcus Vance - Simulated Showcase)', 'success');
    } else {
      setUserState(DEFAULT_DEMO_USER);
      showToast('Switched to Demo Homeowner (Alexander Reed - Simulated Showcase)', 'success');
    }
  };

  const toggleCompare = (proId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(proId)) {
        showToast('Removed professional from comparison table', 'info');
        return prev.filter((id) => id !== proId);
      } else {
        if (prev.length >= 4) {
          showToast('You can compare up to 4 professionals at once', 'warning');
          return prev;
        }
        showToast('Added professional to comparison table', 'success');
        return [...prev, proId];
      }
    });
  };

  const isInCompare = (proId: string) => compareIds.includes(proId);

  const clearCompare = () => {
    setCompareIds([]);
    showToast('Cleared all comparison items', 'info');
  };

  // -------------------------------------------------------------
  // Data Mutations with Optimistic Updates & Automated Rollback
  // -------------------------------------------------------------

  const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt'>): Booking => {
    const bookingRef = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      ...bookingData,
      id: bookingRef,
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      liveStep: 1,
    };

    const prevBookings = bookings;
    const prevCount = user.bookingsCount;

    // Optimistic state update
    setBookings([newBooking, ...prevBookings]);
    setUserState((prev) => ({ ...prev, bookingsCount: prev.bookingsCount + 1 }));
    showToast(`Booking ${newBooking.id} scheduled!`, 'success');

    // Asynchronous database sync with automated rollback
    if (isSupabaseConfigured && isAuthenticated && user.id) {
      bookingsService.createBooking(bookingData, user.id).then(({ data, error }) => {
        if (error) {
          setBookings(prevBookings);
          setUserState((prev) => ({ ...prev, bookingsCount: prevCount }));
          showToast(`Database error: ${error}. Booking was reverted.`, 'error');
        } else if (data) {
          setBookings((current) => current.map((b) => (b.id === bookingRef ? data : b)));
        }
      });
    }

    return newBooking;
  };

  const cancelBooking = (bookingId: string) => {
    const prevBookings = bookings;

    // Optimistic update
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' as const } : b))
    );
    showToast(`Booking ${bookingId} has been cancelled.`, 'info');

    if (isSupabaseConfigured && isAuthenticated && user.id) {
      bookingsService.updateBookingStatus(bookingId, 'Cancelled').then(({ error }) => {
        if (error) {
          setBookings(prevBookings);
          showToast(`Database error: ${error}. Cancellation reverted.`, 'error');
        }
      });
    }
  };

  const advanceBookingStep = (bookingId: string) => {
    let nextStep = 1;
    let nextStatus: Booking['status'] = 'Scheduled';
    const prevBookings = bookings;

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          nextStep = Math.min((b.liveStep || 1) + 1, 5);
          nextStatus = nextStep === 5 ? 'Completed' : nextStep >= 2 ? 'In Progress' : 'Scheduled';
          return { ...b, liveStep: nextStep, status: nextStatus };
        }
        return b;
      })
    );
    showToast('Updated live tracking status simulation', 'info');

    if (isSupabaseConfigured && isAuthenticated && user.id) {
      bookingsService.advanceBookingStep(bookingId, nextStep, nextStatus).then(({ error }) => {
        if (error) {
          setBookings(prevBookings);
          showToast(`Database sync error: ${error}. Step reverted.`, 'error');
        }
      });
    }
  };

  const addProject = (projectData: Omit<Project, 'id'>): Project => {
    const tempId = `proj-${Math.floor(200 + Math.random() * 800)}`;
    const newProj: Project = {
      ...projectData,
      id: tempId,
      feedbacks: projectData.feedbacks || [],
    };

    const prevProjects = projects;
    const prevCount = user.projectsCount;

    setProjects([newProj, ...prevProjects]);
    setUserState((prev) => ({ ...prev, projectsCount: prev.projectsCount + 1 }));
    showToast(`Project "${newProj.title}" initialized!`, 'success');

    if (isSupabaseConfigured && isAuthenticated && user.id) {
      projectsService.createProject(projectData, user.id).then(({ data, error }) => {
        if (error) {
          setProjects(prevProjects);
          setUserState((prev) => ({ ...prev, projectsCount: prevCount }));
          showToast(`Database error: ${error}. Project reverted.`, 'error');
        } else if (data) {
          setProjects((current) => current.map((p) => (p.id === tempId ? data : p)));
        }
      });
    }

    return newProj;
  };

  const updateTaskStatus = (projectId: string, taskId: string, status: 'Pending' | 'In Progress' | 'Completed') => {
    const prevProjects = projects;

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const updatedTasks = proj.tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
        return { ...proj, tasks: updatedTasks };
      })
    );
    showToast(`Task status updated to ${status}`, 'success');

    if (isSupabaseConfigured && isAuthenticated && user.id) {
      projectsService.updateTask(taskId, { status }).then(({ error }) => {
        if (error) {
          setProjects(prevProjects);
          showToast(`Database error: ${error}. Task update reverted.`, 'error');
        }
      });
    }
  };

  const updateMilestoneStatus = (projectId: string, milestoneId: string, status: 'Upcoming' | 'In Progress' | 'Completed') => {
    let updatedPercentage = 0;
    let isPaid = false;
    const prevProjects = projects;

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const updatedMilestones = proj.milestones.map((m) => {
          if (m.id === milestoneId) {
            updatedPercentage = status === 'Completed' ? 100 : status === 'In Progress' ? 50 : 0;
            isPaid = status === 'Completed' ? true : m.isPaid;
            return {
              ...m,
              status,
              percentage: updatedPercentage,
              isPaid,
            };
          }
          return m;
        });

        const completedCount = updatedMilestones.filter((m) => m.status === 'Completed').length;
        const inProgressCount = updatedMilestones.filter((m) => m.status === 'In Progress').length;
        const total = updatedMilestones.length || 1;
        const newProgress = Math.round(((completedCount + inProgressCount * 0.5) / total) * 100);
        const newSpent = updatedMilestones.reduce((acc, m) => (m.isPaid ? acc + m.payoutAmount : acc), 0);

        return { 
          ...proj, 
          milestones: updatedMilestones, 
          progressPercentage: newProgress,
          amountSpent: newSpent > 0 ? newSpent : proj.amountSpent,
          status: newProgress === 100 ? 'Completed' : 'In Progress'
        };
      })
    );
    showToast(`Milestone updated to ${status}`, 'success');

    if (isSupabaseConfigured && isAuthenticated && user.id) {
      projectsService.updateMilestone(milestoneId, {
        status,
        percentage: updatedPercentage,
        isPaid,
      }).then(({ error }) => {
        if (error) {
          setProjects(prevProjects);
          showToast(`Database error: ${error}. Milestone update reverted.`, 'error');
        }
      });
    }
  };

  const updateMaterialStatus = (
    projectId: string, 
    materialId: string, 
    status: 'Requisitioned' | 'Ordered' | 'Delivered' | 'Installed'
  ) => {
    const prevProjects = projects;

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const updatedMaterials = proj.materials.map((m) =>
          m.id === materialId ? { ...m, status } : m
        );
        return { ...proj, materials: updatedMaterials };
      })
    );
    showToast(`Material status updated to ${status}`, 'success');

    if (isSupabaseConfigured && isAuthenticated && user.id) {
      projectsService.updateMaterial(materialId, { status }).then(({ error }) => {
        if (error) {
          setProjects(prevProjects);
          showToast(`Database error: ${error}. Material status reverted.`, 'error');
        }
      });
    }
  };

  const addProjectFeedback = (
    projectId: string, 
    feedbackData: Omit<ProjectFeedback, 'id' | 'createdAt'>
  ) => {
    const newFeedback: ProjectFeedback = {
      ...feedbackData,
      id: `fb-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    const prevProjects = projects;

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const existing = proj.feedbacks || [];
        return { ...proj, feedbacks: [newFeedback, ...existing] };
      })
    );

    showToast('Feedback submitted successfully! Thank you for reviewing.', 'success');

    if (isSupabaseConfigured && isAuthenticated && user.id) {
      projectsService.addReview(projectId, user.id, feedbackData).then(({ error }) => {
        if (error) {
          setProjects(prevProjects);
          showToast(`Database error: ${error}. Feedback submission reverted.`, 'error');
        }
      });
    }
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    const prevUser = user;
    setUserState((prev) => ({ ...prev, ...updates }));
    showToast('Profile information updated', 'success');

    if (isSupabaseConfigured && isAuthenticated && user.id) {
      authService.updateProfile(user.id, updates).then(({ error }) => {
        if (error) {
          setUserState(prevUser);
          showToast(`Database error: ${error}. Profile update reverted.`, 'error');
        }
      });
    }
  };

  const resetDemoData = () => {
    try {
      localStorage.removeItem(LS_DEMO_PROJECTS_KEY);
      localStorage.removeItem(LS_DEMO_BOOKINGS_KEY);
      localStorage.removeItem(LS_COMPARE_KEY);
      localStorage.removeItem(LS_TIER_KEY);
      localStorage.removeItem(LS_DEMO_USER_KEY);
      localStorage.removeItem(LS_DRAFT_KEY);
    } catch (e) {
      console.error(e);
    }

    setProjects(MOCK_PROJECTS);
    setBookings(MOCK_BOOKINGS);
    setCompareIds(['pro-1', 'pro-2', 'pro-3']);
    setSelectedTierState('Balanced');
    setDraftPlanState(null);
    setUserState(DEFAULT_DEMO_USER);
    setIsAuthenticated(false);
    setBackendMode(isSupabaseConfigured ? 'supabase-connected' : 'demo-showcase');

    showToast('Demo data and LocalStorage reset to fresh state', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        professionals,
        projects,
        bookings,
        compareIds,
        toggleCompare,
        isInCompare,
        clearCompare,
        addBooking,
        cancelBooking,
        advanceBookingStep,
        addProject,
        updateTaskStatus,
        updateMilestoneStatus,
        updateMaterialStatus,
        addProjectFeedback,
        draftPlan,
        setDraftPlan,
        selectedTier,
        setSelectedTier,
        toasts,
        showToast,
        removeToast,
        user,
        updateUser,
        resetDemoData,

        // Auth & Backend context
        isSupabaseConfigured,
        backendMode,
        isAuthenticated,
        authLoading,
        authModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        signOut,
        demoSignIn,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
