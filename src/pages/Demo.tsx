import React, { useEffect } from 'react'
import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import { useFinanceStore } from '@/stores/financeStore'

export default function Demo() {
  const { loadDemoData } = useFinanceStore()

  useEffect(() => {
    loadDemoData()
  }, [loadDemoData])

  return (
    <Layout isDemo={true}>
      <Index />
    </Layout>
  )
}
