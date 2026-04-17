import React, { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Shield, 
  Search, 
  RefreshCw, 
  Clock, 
  User as UserIcon, 
  Globe,
  AlertCircle,
  FileDown,
  Calendar
} from 'lucide-react';
import { loginActivityApi, LoginActivityLog } from '../services/api/loginActivityApi';
import { format } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginActivityLogPage: React.FC = () => {
  const [logs, setLogs] = useState<LoginActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const dateObj = selectedDate ? new Date(selectedDate) : undefined;
      const response = await loginActivityApi.getLogs(dateObj);
      if (response.success && Array.isArray(response.data)) {
        setLogs(response.data);
      } else if (response.success && !Array.isArray(response.data)) {
        console.error('Expected array of logs but received:', response.data);
        setError('Received malformed data from server');
      } else {
        setError(response.message || 'Failed to fetch logs');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const dateObj = selectedDate ? new Date(selectedDate) : undefined;
      await loginActivityApi.exportLogsExcel(dateObj);
    } catch (err: any) {
      setError('Export failed: ' + (err.message || 'Unknown error'));
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedDate]);

  const filteredLogs = logs.filter(log => 
    log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && logs.length === 0) {
    return <LoadingSpinner message="Loading login activity..." fullScreen />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-semibold text-foreground">Login Activity Log</h1>
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-muted-foreground">Monitor system access and user login events</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
            <Calendar className="w-4 h-4 text-purple-500 mr-2" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-sm focus:outline-none focus:ring-0 cursor-pointer"
            />
          </div>

          <Button 
            variant="outline" 
            onClick={fetchLogs} 
            disabled={loading}
            className="border-gray-200 hover:bg-gray-50 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button 
            onClick={handleExport} 
            disabled={exporting || logs.length === 0}
            className={`transition-all shadow-md text-black font-medium ${
              logs.length === 0 
                ? 'bg-gray-100 cursor-not-allowed border-gray-200' 
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            <FileDown className={`w-4 h-4 mr-2 ${exporting ? 'animate-pulse' : ''}`} />
            {exporting ? 'Exporting...' : 'Export Excel'}
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                Access History
              </CardTitle>
              <CardDescription>Recent login attempts across the system</CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search user or IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-purple-100 focus:border-purple-300 focus:ring-purple-200"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 mb-6">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}

          <div className="rounded-xl border border-gray-100 overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="w-[250px]">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      User
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      IP Address
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      Login Time
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                      No matching login records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-purple-50/30 transition-colors group">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                            {log.userName}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {log.userId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 font-mono">
                          {log.ipAddress || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-medium text-gray-700">
                            {format(new Date(log.loginTime), 'PPP')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.loginTime), 'p')}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginActivityLogPage;
