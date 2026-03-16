import { RefreshCw, XCircle, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export function DashboardHeader() {
  return (
    <div className="bg-[#1e3a5f] text-white rounded-t-md px-4 py-2 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-400 rounded-sm" />
        <h2 className="font-bold text-sm tracking-wide">DASHBOARD FINANCEIRO</h2>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20">
          <RefreshCw className="h-3 w-3" />
        </Button>
        <Link to="/">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20">
            <Home className="h-3 w-3" />
          </Button>
        </Link>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20">
          <XCircle className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
