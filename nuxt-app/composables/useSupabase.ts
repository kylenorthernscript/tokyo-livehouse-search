import { createClient } from '@supabase/supabase-js'

export const useSupabase = () => {
  const config = useRuntimeConfig()
  
  // デバッグ用ログ
  if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
    console.error('Missing Supabase configuration:', {
      url: config.public.supabaseUrl,
      key: config.public.supabaseAnonKey ? 'Present' : 'Missing'
    })
  }
  
  // 環境変数が設定されていない場合のフォールバック
  const supabaseUrl = config.public.supabaseUrl || process.env.NUXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = config.public.supabaseAnonKey || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration is missing. Please set NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}