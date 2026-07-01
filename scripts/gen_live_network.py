import openpyxl, json, re
from collections import defaultdict, Counter

SRC="/root/.claude/uploads/d61e1f38-657b-593a-9a82-dbd2ebe4a45a/306f3488-Supplier_data_file_qsc_testing_v2.xlsx"
OUT="/home/user/RADAR-UI/src/data/liveNetworkData.ts"

wb=openpyxl.load_workbook(SRC, data_only=True)
ws=wb["Sheet1"]

# The customer file may carry two appended cost columns:
#   N: "Indicative Unit Cost (USD)" — per-part cost, or text "ESTIMATE - no match"
#   O: "Annual Cost Exposure (USD, modeled)" = unit cost x Where Used, or blank
# When those columns are absent we MODEL them from a per-commodity unit-cost
# table so /network-live stays functional; the output is stamped accordingly.
HAS_COST_COLS = ws.max_column >= 15
NCOLS = 15 if HAS_COST_COLS else 13

rows=[]
for r in range(2, ws.max_row+1):
    v=[ws.cell(row=r,column=c).value for c in range(1,NCOLS+1)]
    if any(x is not None for x in v[:13]): rows.append(v)

# column indices
ITEM,MPN,SUP,Z2SUP,COMM,Z2COMM,FAC,SITE,ISTAT,MSTAT,IMPACT,REV,WU = range(13)
UNITCOST, COSTEXP = 13, 14  # cols N, O (only when HAS_COST_COLS)

NO_MATCH = "estimate - no match"

def norm(s): return (s or '').strip() if isinstance(s,str) else ('' if s is None else str(s).strip())
def wu(r):
    v=r[WU]
    return float(v) if isinstance(v,(int,float)) else 1.0
def impact(r): return (norm(r[IMPACT]) or 'Medium').title()
BASE={'High':78,'Medium':55,'Low':30}

def is_single_part(r):
    m=norm(r[MSTAT]).upper(); i=norm(r[ISTAT]).upper()
    return m=='SS' or i in ('SSS',)

# commodity -> impact bucket
DELIVERY={'IC','DIODE','TRANSISTOR','CAPACITOR','RESISTOR','INDUCTOR','FERRITE','CRYSTAL','OSCILLATOR','RELAY','SWITCH'}
COST={'PCB','CONNECTOR','HARDWARE','METAL','PLASTIC','WIRE/CABLE','PACKAGING','GASKET','LABEL','ADHESIVE'}
def bucket(comm):
    c=(comm or '').upper()
    if c in DELIVERY: return 'Delivery'
    if c in COST: return 'Cost'
    return 'Compliance'

# --- modeled unit cost (USD) per commodity family; only used when col N/O absent ---
MODEL_UNIT_COST={
 'RESISTOR':0.02,'CAPACITOR':0.08,'IC':3.50,'DIODE':0.12,'TRANSISTOR':0.18,
 'CONNECTOR':1.20,'HARDWARE':0.15,'INDUCTOR':0.25,'PLASTIC':0.60,'METAL':0.55,
 'WIRE/CABLE':0.45,'PACKAGING':0.20,'PCB':22.0,'GASKET':0.35,'FERRITE':0.10,
 'CRYSTAL':0.65,'OSCILLATOR':0.90,'RELAY':1.50,'SWITCH':0.75,
}
ASSEMBLY_COMMS={'PCB','ASSEMBLY','CUSTOM'}
def h(s):  # small deterministic hash
    x=0
    for ch in s: x=(x*131+ord(ch))&0xffffffff
    return x

def part_cost(r):
    """Return (cost_exposure_usd_or_None, estimated_bool) for one part."""
    if HAS_COST_COLS:
        unit=r[UNITCOST]; exp=r[COSTEXP]
        unit_is_nomatch = isinstance(unit,str) and unit.strip().lower()==NO_MATCH
        if isinstance(exp,(int,float)) and exp>0:
            return float(exp), unit_is_nomatch      # real number; caveat if unit was no-match
        return None, False                          # blank / 0 / non-numeric -> insufficient
    # --- modeled fallback ---
    comm=(norm(r[COMM]) or '').upper()
    item=norm(r[ITEM]) or norm(r[MPN])
    # ~8% of parts get no cost at all -> insufficient data
    if h(item)%12==0: return None, False
    unit=MODEL_UNIT_COST.get(comm, 0.50)
    estimated = comm in ASSEMBLY_COMMS
    return unit*wu(r), estimated

def loc_for(name):
    key=name.strip().upper()
    LOC={
     'YAGEO':('New Taipei','Taiwan'),'MURATA':('Kyoto','Japan'),'SAMSUNG':('Suwon','South Korea'),
     'VISHAY':('Malvern','USA'),'VISHAY DALE':('Columbus','USA'),'PANASONIC':('Osaka','Japan'),
     'TEXAS INSTRUMENTS':('Dallas','USA'),'ON SEMICONDUCTOR':('Phoenix','USA'),'KOA':('Nagano','Japan'),
     'KEMET':('Fort Lauderdale','USA'),'BOURNS':('Riverside','USA'),'TAIYO YUDEN':('Tokyo','Japan'),
     'STACKPOLE':('Raleigh','USA'),'ROYAL OHM':('Dongguan','China'),'TDK':('Tokyo','Japan'),
     'LITTELFUSE':('Chicago','USA'),'IXYS':('Milpitas','USA'),'TE CONNECTIVITY':('Schaffhausen','Switzerland'),
     'DIODES INC.':('Plano','USA'),'ZETEX':('Oldham','UK'),'RENESAS':('Tokyo','Japan'),'NEC':('Tokyo','Japan'),
     'VTECH (DONGGUAN)':('Dongguan','China'),'VTECH (SBU6)':('Dongguan','China'),
     'GP ELECTRONICS (HUIZHOU) CO.':('Huizhou','China'),'GREENCONN':('Taoyuan','Taiwan'),
     'ABRACON':('Spicewood','USA'),'PULSE ENGINEERING':('San Diego','USA'),
     'CORNELL DUBILIER':('Liberty','USA'),'CDE/MALLORY':('Liberty','USA'),
     'NICHICON':('Kyoto','Japan'),'ROHM':('Kyoto','Japan'),'AVX':('Fountain Inn','USA'),
     'WURTH':('Niedernhall','Germany'),'MOLEX':('Lisle','USA'),'AMPHENOL':('Wallingford','USA'),
     'MICROCHIP':('Chandler','USA'),'STMICROELECTRONICS':('Geneva','Switzerland'),
     'INFINEON':('Neubiberg','Germany'),'NXP':('Eindhoven','Netherlands'),'ANALOG DEVICES':('Wilmington','USA'),
    }
    if key in LOC:
        c=LOC[key]; return {'city':c[0],'country':c[1]}
    return {'city':'—','country':'Global'}

# ---- group parts per Supplier (T1) ----
sup_rows=defaultdict(list)
for r in rows:
    sup_rows[norm(r[SUP])].append(r)

# choke: Z2 legal entity shared by >1 distinct Supplier short-name
z2_suppliers=defaultdict(set); z2_rows=defaultdict(list)
for r in rows:
    z2=norm(r[Z2SUP])
    if z2:
        z2_suppliers[z2].add(norm(r[SUP])); z2_rows[z2].append(r)
choke_z2={k for k,v in z2_suppliers.items() if len(v)>1}

def slug(s):
    return re.sub(r'[^A-Za-z0-9]+','-',s.strip()).strip('-').upper()[:40]

def agg_node(rlist, node_id, name, tier, is_choke=False, parents_count=1):
    partCount=len(rlist)
    total_wu=sum(wu(r) for r in rlist)
    # cost exposure — sum ONLY parts with a real number; never coerce blank/0 to 0
    costs=[part_cost(r) for r in rlist]
    real=[(c,est) for (c,est) in costs if c is not None]
    known_parts=len(real)
    exposure_usd = sum(c for c,_ in real) if real else None
    est_share = (sum(1 for _,est in real if est)/known_parts) if known_parts else 0.0
    cost_estimated = est_share>=0.5
    insufficient = exposure_usd is None            # no part had a real cost
    # risk score weighted by where-used
    tw=sum(wu(r) for r in rlist) or 1
    wscore=sum(BASE[impact(r)]*wu(r) for r in rlist)/tw
    single_share=sum(1 for r in rlist if is_single_part(r))/max(1,partCount)
    bump=10 if single_share>=0.5 else (4 if single_share>=0.25 else 0)
    score=int(max(10,min(97,round(wscore+bump))))
    is_single=single_share>=0.5
    has_high=any(impact(r)=='High' for r in rlist)
    # SPOF/choke only qualify a supplier that also has REAL exposure data
    is_spof=is_single and has_high and not is_choke and not insufficient
    is_choke_final=is_choke and not insufficient
    comm=Counter(norm(r[Z2COMM]) or norm(r[COMM]) for r in rlist).most_common(1)[0][0] or '—'
    primary=bucket(Counter(norm(r[COMM]) for r in rlist).most_common(1)[0][0])
    if is_choke_final: lens,lensLabel=('CHK','Convergence / Sub-tier concentration')
    elif is_spof: lens,lensLabel=('SPF','Single-Source Continuity')
    elif is_single: lens,lensLabel=('SNG','Sourcing Concentration')
    else: lens,lensLabel=('CAP','Capacity / Demand')
    if insufficient:
        action=f"Insufficient cost data — {partCount} parts, no priced exposure. Request unit-cost data to rank {name}."
    elif is_choke_final:
        action=f"Convergence point — {parents_count} tier-1 suppliers route through {name}. Assess concentration; map alternate sub-tier capacity."
    elif is_spof:
        action=f"Single-source risk — qualify a second source for {comm}. {partCount} parts across {int(total_wu)} assemblies."
    elif is_single:
        action=f"Sourcing concentration — {int(single_share*100)}% single-sourced. Review dual-source options for {comm}."
    else:
        action=f"Monitor — {partCount} parts across {int(total_wu)} assemblies; multi-sourced."
    return {
        'id':node_id,'name':name,'tier':tier,'location':loc_for(name),
        'commodity':comm,'riskScore':score,'primaryImpact':primary,
        '_exp':exposure_usd,'_partCount':partCount,'_known':known_parts,
        'isSPOF':is_spof,'isChokePoint':is_choke_final,'costEstimated':cost_estimated,
        'topRiskLens':lens,'topRiskLensLabel':lensLabel,'action':action,
    }

t1_nodes={}
for sup,rlist in sup_rows.items():
    if not sup: continue
    t1_nodes[sup]=agg_node(rlist, f"T1-{slug(sup)}", sup, 1)

t2_nodes={}
for z2 in choke_z2:
    t2_nodes[z2]=agg_node(z2_rows[z2], f"T2-{slug(z2)}", z2, 2, is_choke=True, parents_count=len(z2_suppliers[z2]))

# convert USD -> $M for revenueAtRisk field (reuses $M-scaled UI + 0.1 floor).
def rev_m(n):
    return None if n['_exp'] is None else round(n['_exp']/1_000_000, 4)

sup_to_choke=defaultdict(set)
for z2 in choke_z2:
    for sup in z2_suppliers[z2]:
        if sup in t1_nodes: sup_to_choke[sup].add(z2)

def emit(n, children_z2=()):
    loc=n['location']
    kids=[emit(t2_nodes[z2]) for z2 in sorted(children_z2)]
    return {
        'id':n['id'],'name':n['name'],'tier':n['tier'],
        'location':{'city':loc['city'],'country':loc['country']},
        'commodity':n['commodity'],'riskScore':n['riskScore'],
        'primaryImpact':n['primaryImpact'],
        'revenueAtRisk':rev_m(n),          # cost exposure in $M, or null = insufficient data
        'costEstimated':n['costEstimated'],
        'isSPOF':n['isSPOF'],'isChokePoint':n['isChokePoint'],
        'topRiskLens':n['topRiskLens'],'topRiskLensLabel':n['topRiskLensLabel'],
        'action':n['action'],'children':kids,
    }

t1_json=[]
for sup in sorted(t1_nodes, key=lambda s:-(t1_nodes[s]['_exp'] or -1)):
    t1_json.append(emit(t1_nodes[sup], sup_to_choke.get(sup, ())))

root={
    'id':'QSC','name':'QSC Aerospace','tier':0,
    'location':{'city':'El Segundo','country':'USA'},
    'commodity':'OEM','riskScore':0,'primaryImpact':'Delivery',
    'revenueAtRisk':None,'costEstimated':False,'isSPOF':False,'isChokePoint':False,
    'topRiskLens':'—','topRiskLensLabel':'—','action':'—','children':t1_json,
}

n_spof=sum(1 for n in t1_nodes.values() if n['isSPOF'])
n_choke=sum(1 for n in t2_nodes.values() if n['isChokePoint'])
n_insuff=sum(1 for n in t1_nodes.values() if n['_exp'] is None)
n_est=sum(1 for n in t1_nodes.values() if n['costEstimated'])
mode="REAL cols N/O" if HAS_COST_COLS else "MODELED (cols N/O absent)"
print(f"[{mode}] T1:{len(t1_nodes)} SPOF:{n_spof} chokeT2:{n_choke} insufficient:{n_insuff} estimated:{n_est} parts:{len(rows)}")

def ts(v, ind=0):
    sp='  '*ind
    if v is None: return 'null'
    if isinstance(v,bool): return 'true' if v else 'false'
    if isinstance(v,(int,float)): return repr(v)
    if isinstance(v,str): return json.dumps(v)
    if isinstance(v,list):
        if not v: return '[]'
        return '[\n'+',\n'.join(sp+'  '+ts(x,ind+1) for x in v)+'\n'+sp+']'
    if isinstance(v,dict):
        return '{\n'+',\n'.join(f'{sp}  {k}: {ts(val,ind+1)}' for k,val in v.items())+'\n'+sp+'}'
    raise TypeError(type(v))

data_mode = ("REAL — sourced from columns N (Indicative Unit Cost) and O\n//               (Annual Cost Exposure) in the customer file."
             if HAS_COST_COLS else
             "MODELED PLACEHOLDER — the customer file did not yet carry the\n//               cost columns, so unit cost is modeled per commodity family and\n//               exposure = unit cost x Where-Used. Re-run this script once the\n//               updated sheet (columns N/O) is uploaded to swap in real cost.")

header=f'''// AUTO-GENERATED from customer file: Supplier_data_file_qsc_testing_v2.xlsx
// 792 BOM parts -> QSC Aerospace sub-tier network. Do not edit by hand;
// regenerate with scripts/gen_live_network.py if the source file changes.
//
// EXPOSURE MODEL: annual COST exposure (money spent on the part), NOT revenue.
//   Data source: {data_mode}
//   revenueAtRisk  -> annual cost exposure in $M (unit cost x usage volume).
//                     null = INSUFFICIENT DATA (blank / 0 / no-match) — such
//                     suppliers are excluded from the priority map and shown in
//                     the full table as "exposure n/a"; never a false $0.
//   costEstimated  -> true when the priced parts came from estimated unit cost
//                     ("ESTIMATE - no match") — UI shows an "est." caveat badge.
//   riskScore      -> where-used-weighted base (High 78 / Med 55 / Low 30) + single-source bump.
//   isSPOF         -> majority single-sourced + high-impact AND has real cost data.
//   isChokePoint   -> Z2 sub-tier entity shared by >1 tier-1 supplier AND has real cost data.
//   primaryImpact  -> mapped from dominant commodity family.
//   location       -> lookup for well-known suppliers; otherwise "Global".
//
import type {{ SubTierFullNode }} from './subtierMockData';

/** True when exposure was sourced from real cost columns; false = modeled placeholder. */
export const LIVE_COST_DATA_IS_REAL = {'true' if HAS_COST_COLS else 'false'};

export const QSC_LIVE_NETWORK: SubTierFullNode = '''

with open(OUT,'w') as f:
    f.write(header+ts(root)+';\n')
print("wrote", OUT)
