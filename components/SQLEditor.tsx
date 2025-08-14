import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Play, Download, Copy, Database, Table, RefreshCcw } from '../constants';
import PageHeader from './PageHeader';

interface QueryResult {
  data: any[] | null;
  error: string | null;
  executionTime: number;
  rowCount: number;
}

interface TableInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
}

const SQLEditor: React.FC = () => {
  const [query, setQuery] = useState('-- Tulis query SQL Anda di sini\nSELECT * FROM users LIMIT 10;');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'query' | 'schema'>('query');
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableStructure, setTableStructure] = useState<TableInfo[]>([]);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load database schema
  const loadSchema = async () => {
    setLoadingSchema(true);
    try {
      const { data, error } = await supabase.rpc('get_table_names');
      if (error) {
        // Fallback: get table names from information_schema
        const { data: schemaData, error: schemaError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');

        if (!schemaError && schemaData) {
          setTables(schemaData.map((t: any) => t.table_name));
        }
      } else {
        setTables(data || []);
      }
    } catch (err) {
      console.error('Error loading schema:', err);
    }
    setLoadingSchema(false);
  };

  // Get table structure
  const getTableStructure = async (tableName: string) => {
    try {
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', tableName)
        .eq('table_schema', 'public')
        .order('ordinal_position');

      if (!error && data) {
        setTableStructure(data.map((col: any) => ({
          table_name: tableName,
          column_name: col.column_name,
          data_type: col.data_type,
          is_nullable: col.is_nullable
        })));
      }
    } catch (err) {
      console.error('Error getting table structure:', err);
    }
  };

  // Execute SQL query
  const executeQuery = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    const startTime = Date.now();

    try {
      // Handle different types of queries
      const trimmedQuery = query.trim().toUpperCase();

      if (trimmedQuery.startsWith('SELECT') || trimmedQuery.startsWith('WITH')) {
        const { data, error } = await supabase.rpc('execute_sql', { query_text: query });

        if (error) {
          setResult({
            data: null,
            error: error.message,
            executionTime: Date.now() - startTime,
            rowCount: 0
          });
        } else {
          setResult({
            data: data || [],
            error: null,
            executionTime: Date.now() - startTime,
            rowCount: data?.length || 0
          });
        }
      } else {
        // For INSERT, UPDATE, DELETE queries
        const { data, error, count } = await supabase.rpc('execute_sql', { query_text: query });

        setResult({
          data: data || [],
          error: error?.message || null,
          executionTime: Date.now() - startTime,
          rowCount: count || 0
        });
      }
    } catch (err) {
      setResult({
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        executionTime: Date.now() - startTime,
        rowCount: 0
      });
    }

    setIsLoading(false);
  };

  // Copy result to clipboard
  const copyResult = () => {
    if (result?.data) {
      navigator.clipboard.writeText(JSON.stringify(result.data, null, 2));
    }
  };

  // Download result as JSON
  const downloadResult = () => {
    if (result?.data) {
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `query-result-${new Date().toISOString().slice(0, 19)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Load schema on component mount
  React.useEffect(() => {
    loadSchema();
  }, []);

  // Load table structure when table is selected
  React.useEffect(() => {
    if (selectedTable) {
      getTableStructure(selectedTable);
    }
  }, [selectedTable]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="SQL Editor"
        subtitle="Jalankan query SQL langsung ke database Supabase Anda"
      />

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Schema Explorer */}
        <div className="lg:col-span-1">
          <div className="bg-brand-surface p-4 rounded-2xl border border-brand-border h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-brand-text-light flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Schema
              </h3>
              <button
                onClick={loadSchema}
                disabled={loadingSchema}
                className="p-1 hover:bg-brand-bg rounded-lg transition-colors"
              >
                <RefreshCcw className={`w-4 h-4 text-brand-text-secondary ${loadingSchema ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-2">
              {tables.map(table => (
                <button
                  key={table}
                  onClick={() => setSelectedTable(selectedTable === table ? '' : table)}
                  className={`w-full text-left p-2 rounded-lg transition-colors flex items-center gap-2 ${
                    selectedTable === table
                      ? 'bg-brand-accent text-white'
                      : 'hover:bg-brand-bg text-brand-text-secondary'
                  }`}
                >
                  <Table className="w-4 h-4" />
                  {table}
                </button>
              ))}
            </div>

            {/* Table Structure */}
            {selectedTable && tableStructure.length > 0 && (
              <div className="mt-4 pt-4 border-t border-brand-border">
                <h4 className="font-medium text-brand-text-light mb-2">{selectedTable}</h4>
                <div className="space-y-1 text-xs">
                  {tableStructure.map(col => (
                    <div key={col.column_name} className="flex justify-between">
                      <span className="text-brand-text-light">{col.column_name}</span>
                      <span className="text-brand-text-secondary">{col.data_type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="lg:col-span-3">
          <div className="bg-brand-surface rounded-2xl border border-brand-border overflow-hidden">
            {/* Query Editor */}
            <div className="p-4 border-b border-brand-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-brand-text-light">Query Editor</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setQuery('')}
                    className="px-3 py-1 text-sm bg-brand-bg hover:bg-brand-input rounded-lg transition-colors text-brand-text-secondary"
                  >
                    Clear
                  </button>
                  <button
                    onClick={executeQuery}
                    disabled={isLoading}
                    className="px-4 py-2 bg-brand-accent hover:bg-brand-accent/80 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    {isLoading ? 'Executing...' : 'Execute'}
                  </button>
                </div>
              </div>

              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-40 bg-brand-bg border border-brand-border rounded-lg p-4 text-brand-text-light font-mono text-sm resize-none focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                placeholder="Tulis query SQL Anda di sini..."
                spellCheck={false}
              />
            </div>

            {/* Results Area */}
            {result && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-brand-text-light">Results</h3>
                    <div className="text-sm text-brand-text-secondary">
                      {result.error ? (
                        <span className="text-brand-danger">Error</span>
                      ) : (
                        <>
                          {result.rowCount} rows • {result.executionTime}ms
                        </>
                      )}
                    </div>
                  </div>

                  {result.data && !result.error && (
                    <div className="flex gap-2">
                      <button
                        onClick={copyResult}
                        className="p-2 bg-brand-bg hover:bg-brand-input rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4 text-brand-text-secondary" />
                      </button>
                      <button
                        onClick={downloadResult}
                        className="p-2 bg-brand-bg hover:bg-brand-input rounded-lg transition-colors"
                        title="Download as JSON"
                      >
                        <Download className="w-4 h-4 text-brand-text-secondary" />
                      </button>
                    </div>
                  )}
                </div>

                {result.error ? (
                  <div className="bg-brand-danger/10 border border-brand-danger/20 rounded-lg p-4">
                    <pre className="text-brand-danger text-sm whitespace-pre-wrap">{result.error}</pre>
                  </div>
                ) : result.data && result.data.length > 0 ? (
                  <div className="overflow-auto max-h-96 border border-brand-border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-brand-bg sticky top-0">
                        <tr>
                          {Object.keys(result.data[0]).map(key => (
                            <th key={key} className="p-3 text-left font-medium text-brand-text-light border-b border-brand-border">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.data.map((row, index) => (
                          <tr key={index} className="hover:bg-brand-bg/50">
                            {Object.values(row).map((value, cellIndex) => (
                              <td key={cellIndex} className="p-3 border-b border-brand-border text-brand-text-secondary">
                                {value === null ? (
                                  <span className="text-brand-text-secondary italic">null</span>
                                ) : typeof value === 'object' ? (
                                  <span className="text-blue-400">{JSON.stringify(value)}</span>
                                ) : (
                                  String(value)
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-brand-text-secondary">
                    {result.rowCount === 0 ? 'Query executed successfully. No rows returned.' : 'No data to display.'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Templates */}
      <div className="bg-brand-surface p-4 rounded-2xl border border-brand-border">
        <h3 className="font-semibold text-brand-text-light mb-4">Quick Templates</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setQuery('SELECT * FROM users LIMIT 10;')}
            className="p-3 bg-brand-bg hover:bg-brand-input rounded-lg transition-colors text-left"
          >
            <div className="font-medium text-brand-text-light text-sm">Users</div>
            <div className="text-xs text-brand-text-secondary">SELECT * FROM users</div>
          </button>
          <button
            onClick={() => setQuery('SELECT * FROM projects WHERE status != \'Selesai\' LIMIT 10;')}
            className="p-3 bg-brand-bg hover:bg-brand-input rounded-lg transition-colors text-left"
          >
            <div className="font-medium text-brand-text-light text-sm">Active Projects</div>
            <div className="text-xs text-brand-text-secondary">Non-completed projects</div>
          </button>
          <button
            onClick={() => setQuery('SELECT COUNT(*) as total_transactions, SUM(amount) as total_amount FROM transactions WHERE type = \'INCOME\';')}
            className="p-3 bg-brand-bg hover:bg-brand-input rounded-lg transition-colors text-left"
          >
            <div className="font-medium text-brand-text-light text-sm">Income Summary</div>
            <div className="text-xs text-brand-text-secondary">Total income stats</div>
          </button>
          <button
            onClick={() => setQuery('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' ORDER BY table_name;')}
            className="p-3 bg-brand-bg hover:bg-brand-input rounded-lg transition-colors text-left"
          >
            <div className="font-medium text-brand-text-light text-sm">List Tables</div>
            <div className="text-xs text-brand-text-secondary">Show all tables</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SQLEditor;