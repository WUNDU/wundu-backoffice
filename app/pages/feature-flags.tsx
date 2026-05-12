import React, { useState, useEffect } from 'react';
import { Flag, ToggleLeft, ToggleRight } from 'lucide-react';
import { AdminLayout } from '~/components/dashboard/AdminLayout';
import { featureFlagsService } from '~/services/admin/feature-flags.service';
import type { AdminFeatureFlag } from '~/types/admin';

const FeatureFlagsPage: React.FC = () => {
  const [flags, setFlags] = useState<AdminFeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    featureFlagsService.list()
      .then(setFlags)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (flag: AdminFeatureFlag) => {
    setToggling(flag.key);
    try {
      const updated = await featureFlagsService.update(flag.key, { enabled: !flag.enabled });
      setFlags(prev => prev.map(f => f.key === flag.key ? updated : f));
    } catch (e) { console.error(e); }
    finally { setToggling(null); }
  };

  return (
    <AdminLayout>
      <div className="px-6 py-5 space-y-5">
        <h1 className="text-[22px] font-semibold tracking-tight text-gray-900 flex items-center gap-2">
          <Flag size={22} className="text-[#003cc3]" /> Feature Flags
        </h1>

        <div className="rounded-md border border-gray-200 bg-white p-6">
          {loading ? (
            <p className="text-center text-gray-500 py-8">A carregar...</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {flags.length > 0 ? flags.map(flag => (
                <div key={flag.key} className="flex items-center justify-between py-4 px-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{flag.key}</p>
                    {flag.description && <p className="text-xs text-gray-500 mt-0.5">{flag.description}</p>}
                  </div>
                  <button
                    onClick={() => handleToggle(flag)}
                    disabled={toggling === flag.key}
                    className="flex items-center gap-2 text-sm font-medium transition-colors"
                  >
                    {flag.enabled
                      ? <ToggleRight size={28} className="text-green-500" />
                      : <ToggleLeft size={28} className="text-gray-400" />}
                    <span className={flag.enabled ? 'text-green-600' : 'text-gray-500'}>
                      {flag.enabled ? 'Activo' : 'Inactivo'}
                    </span>
                  </button>
                </div>
              )) : (
                <p className="text-center text-gray-500 py-8">Sem feature flags.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default FeatureFlagsPage;
