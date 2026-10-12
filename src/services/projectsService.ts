import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Project, ProjectMilestone, ProjectTask, ProjectMaterial, ProjectFeedback } from '../types';

export const projectsService = {
  async fetchProjects(userId?: string): Promise<{ data: Project[] | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      let query = supabase
        .from('projects')
        .select(`
          *,
          contractor:provider_profiles(*),
          milestones:project_milestones(*),
          tasks:project_tasks(*),
          materials:material_items(*),
          photos:project_photos(*),
          feedbacks:reviews(*)
        `)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('customer_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Map Supabase snake_case rows to Project model
      const mapped: Project[] = (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        type: row.project_type,
        location: row.location,
        startDate: row.start_date || 'TBD',
        estimatedCompletion: row.estimated_completion_date || 'TBD',
        progressPercentage: row.progress_percentage || 0,
        budgetEstimated: Number(row.budget_estimated),
        agreedQuotation: Number(row.agreed_quotation),
        amountSpent: Number(row.amount_spent),
        tier: row.tier || 'Balanced',
        assignedWorkersCount: row.assigned_workers_count || 1,
        status: row.status || 'Planning',
        contractor: row.contractor
          ? {
              name: row.contractor.business_name,
              company: row.contractor.business_name,
              avatar: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=300&auto=format&fit=crop&q=80',
              phone: '+1 (555) 302-8491',
              rating: Number(row.contractor.rating) || 4.9,
            }
          : {
              name: 'Apex Infra Projects',
              company: 'Apex Infra Projects',
              avatar: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=300&auto=format&fit=crop&q=80',
              phone: '+1 (555) 302-8491',
              rating: 4.9,
            },
        milestones: (row.milestones || []).map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description || '',
          percentage: m.percentage || 0,
          status: m.status || 'Upcoming',
          targetDate: m.target_date || '',
          payoutAmount: Number(m.payout_amount) || 0,
          isPaid: Boolean(m.is_paid),
        })),
        tasks: (row.tasks || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          status: t.status || 'Pending',
          assignedTo: t.assigned_to || 'Assigned Crew',
          dueDate: t.due_date || '',
          category: t.category || 'General',
        })),
        materials: (row.materials || []).map((mat: any) => ({
          id: mat.id,
          name: mat.name,
          quantity: mat.quantity,
          estimatedCost: Number(mat.estimated_cost) || 0,
          status: mat.status || 'Requisitioned',
          supplier: mat.supplier || 'Buildzy Verified Hub',
        })),
        photos: (row.photos || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          date: p.uploaded_at ? new Date(p.uploaded_at).toLocaleDateString() : '',
          imageUrl: p.image_url,
          milestoneTitle: p.milestone_title || 'General Inspection',
        })),
        feedbacks: (row.feedbacks || []).map((fb: any) => ({
          id: fb.id,
          authorName: fb.author_name || 'Customer',
          rating: fb.rating || 5,
          category: fb.category || 'Overall Experience',
          comment: fb.comment || '',
          createdAt: fb.created_at ? new Date(fb.created_at).toLocaleDateString() : '',
        })),
      }));

      return { data: mapped, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to fetch projects' };
    }
  },

  async createProject(project: Omit<Project, 'id'>, customerId: string): Promise<{ data: Project | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      // 1. Insert main project
      const { data: projData, error: projErr } = await supabase
        .from('projects')
        .insert({
          customer_id: customerId,
          title: project.title,
          project_type: project.type,
          tier: project.tier,
          location: project.location,
          budget_estimated: project.budgetEstimated,
          agreed_quotation: project.agreedQuotation,
          amount_spent: project.amountSpent,
          progress_percentage: project.progressPercentage,
          assigned_workers_count: project.assignedWorkersCount,
          status: project.status,
        })
        .select()
        .single();

      if (projErr) throw projErr;
      const projectId = projData.id;

      // 2. Insert milestones if any
      if (project.milestones?.length) {
        const milestonesToInsert = project.milestones.map((m, idx) => ({
          project_id: projectId,
          title: m.title,
          description: m.description,
          order_index: idx + 1,
          status: m.status,
          percentage: m.percentage,
          payout_amount: m.payoutAmount,
          is_paid: m.isPaid,
        }));
        await supabase.from('project_milestones').insert(milestonesToInsert);
      }

      // 3. Insert tasks if any
      if (project.tasks?.length) {
        const tasksToInsert = project.tasks.map((t) => ({
          project_id: projectId,
          title: t.title,
          status: t.status,
          assigned_to: t.assignedTo,
          due_date: t.dueDate ? new Date().toISOString().slice(0, 10) : null,
          category: t.category,
        }));
        await supabase.from('project_tasks').insert(tasksToInsert);
      }

      // 4. Insert materials if any
      if (project.materials?.length) {
        const matsToInsert = project.materials.map((m) => ({
          project_id: projectId,
          name: m.name,
          quantity: m.quantity,
          estimated_cost: m.estimatedCost,
          supplier: m.supplier,
          status: m.status,
        }));
        await supabase.from('material_items').insert(matsToInsert);
      }

      return { data: { ...project, id: projectId }, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Failed to create project' };
    }
  },

  async updateMilestone(milestoneId: string, updates: Partial<ProjectMilestone>): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured) return { error: null };
    const { error } = await supabase
      .from('project_milestones')
      .update({
        status: updates.status,
        percentage: updates.percentage,
        is_paid: updates.isPaid,
      })
      .eq('id', milestoneId);
    return { error: error ? error.message : null };
  },

  async updateTask(taskId: string, updates: Partial<ProjectTask>): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured) return { error: null };
    const { error } = await supabase
      .from('project_tasks')
      .update({ status: updates.status })
      .eq('id', taskId);
    return { error: error ? error.message : null };
  },

  async updateMaterial(materialId: string, updates: Partial<ProjectMaterial>): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured) return { error: null };
    const { error } = await supabase
      .from('material_items')
      .update({ status: updates.status })
      .eq('id', materialId);
    return { error: error ? error.message : null };
  },

  async addReview(projectId: string, authorId: string, feedback: Omit<ProjectFeedback, 'id' | 'createdAt'>): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured) return { error: null };
    const { error } = await supabase
      .from('reviews')
      .insert({
        project_id: projectId,
        author_id: authorId,
        rating: feedback.rating,
        category: feedback.category,
        comment: feedback.comment,
      });
    return { error: error ? error.message : null };
  },
};
