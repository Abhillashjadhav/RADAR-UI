import { useState } from 'react';
import { UploadCloud, FileSpreadsheet } from 'lucide-react';
import { CARD, SECTION_LABEL, GOLD_BTN, WHITE_BTN } from '../../theme/tokens';
import PageTitle from '../Layout/PageTitle';

// Schema chips — the red-starred set is required in the customer file
const SCHEMA_FIELDS: { name: string; required: boolean }[] = [
  { name: 'Item Number', required: true },
  { name: 'MPN', required: true },
  { name: 'Supplier', required: true },
  { name: 'Where Used', required: true },
  { name: 'Z2 Supplier', required: false },
  { name: 'Commodity', required: false },
  { name: 'Z2 Commodity', required: false },
  { name: 'Facility Type', required: false },
  { name: 'Site Owner', required: false },
  { name: 'Item Sourcing Status', required: false },
  { name: 'MPN Sourcing Status', required: false },
  { name: 'Impact Score', required: false },
  { name: 'Indicative Unit Cost (USD)', required: false },
  { name: 'Annual Cost Exposure (USD)', required: false },
];

/** RADAR Data Mapper — production onboarding surface (RADAR > Onboarding). */
export default function DataMapper() {
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className="p-6 max-w-screen-lg mx-auto space-y-5">
      <div>
        <PageTitle>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">RADAR Data Mapper</h1>
        </PageTitle>
        <p className="text-sm text-gray-500 mt-1">
          Upload your supplier file and map its columns to the RADAR schema.
        </p>
      </div>

      {/* Dropzone */}
      <div className={`${CARD} p-8`}>
        <label
          className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-2xl py-12 px-6 text-center cursor-pointer hover:border-amber-300 transition-colors"
        >
          <UploadCloud size={34} className="text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-gray-800">Drag &amp; drop your supplier file here</p>
            <p className="text-xs text-gray-400 mt-0.5">CSV or XLSX · up to 10 MB · one sheet per upload</p>
          </div>
          <span className={WHITE_BTN}>
            <FileSpreadsheet size={13} />
            Select File
          </span>
          <input
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={e => setFileName(e.target.files?.[0]?.name ?? null)}
          />
          {fileName && <p className="text-xs font-semibold text-amber-600">{fileName}</p>}
        </label>

        {/* Schema chips */}
        <div className="mt-6">
          <p className={`${SECTION_LABEL} mb-2`}>Expected schema — <span className="text-red-500 normal-case">*</span> required</p>
          <div className="flex flex-wrap gap-1.5">
            {SCHEMA_FIELDS.map(f => (
              <span
                key={f.name}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                  f.required
                    ? 'bg-amber-50 border-amber-200 text-gray-800'
                    : 'bg-white border-gray-200 text-gray-500'
                }`}
              >
                {f.name}
                {f.required && <span className="text-red-500 ml-0.5">*</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Proceed */}
        <div className="mt-6 flex justify-end">
          <button className={GOLD_BTN} disabled={!fileName} style={{ opacity: fileName ? 1 : 0.5 }}>
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
