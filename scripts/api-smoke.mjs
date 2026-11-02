// End-to-end smoke test: node scripts/smoke.mjs  (API must be running)
const B = process.env.API || "http://localhost:5050/api/v1";
let token = "", fails = 0;
const call = async (m, p, body, label) => {
  const r = await fetch(B + p, { method: m, headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) }, body: body ? JSON.stringify(body) : undefined });
  let j = {}; try { j = await r.json(); } catch {}
  const ok = r.status < 400; if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"} ${r.status} ${m} ${p}${label ? " ["+label+"]" : ""}${ok ? "" : " -> " + (j.message || JSON.stringify(j)).slice(0,100)}`);
  return j;
};
const id = (o) => o?.data?.[Object.keys(o.data).find(k => o.data[k]?._id)]?._id;
const s = Date.now();
let j = await call("POST", "/auth/register", { name: "Test", email: `t${s}@x.com`, password: "Passw0rd!23" });
token = j.data?.token || j.token || "";
if (!token) { j = await call("POST", "/auth/login", { email: `t${s}@x.com`, password: "Passw0rd!23" }); token = j.data?.token || j.token || ""; }
await call("GET", "/auth/me");
const org = id(await call("POST", "/organizations", { name: "Org " + s, slug: "org-" + s }));
await call("GET", "/organizations");
const ten = id(await call("POST", `/organizations/${org}/tenants`, { name: "Ten", slug: "ten-" + s }));
await call("GET", `/organizations/${org}/tenants`);
const board = id(await call("POST", `/tenants/${ten}/boards`, { name: "Board" }));
await call("GET", `/tenants/${ten}/boards`);
const c1 = id(await call("POST", `/boards/${board}/columns`, { name: "Todo" }));
const c2 = id(await call("POST", `/boards/${board}/columns`, { name: "Done" }));
await call("GET", `/boards/${board}/columns`);
await call("PATCH", `/columns/${c1}`, { name: "To do" });
let t = await call("POST", `/boards/${board}/tasks`, { title: "Task 1", columnId: c1 });
const task = id(t); let v = t.data?.task?.version ?? 0;
await call("GET", `/boards/${board}/tasks`);
await call("GET", `/tasks/${task}`);
t = await call("PATCH", `/tasks/${task}`, { title: "Task 1b", version: v }); v = t.data?.task?.version ?? v + 1;
t = await call("PATCH", `/tasks/${task}/move`, { columnId: c2, position: 1000, version: v }); v = t.data?.task?.version ?? v + 1;
await call("PATCH", `/tasks/${task}`, { title: "stale", version: 0 }, "expect 409");
await call("GET", `/tenants/${ten}/activity`);
await call("GET", `/boards/${board}/activity`);
await call("GET", `/tasks/${task}/activity`);
await call("GET", `/tenants/${ten}/members`);
await call("GET", `/organizations/${org}/members`);
await call("GET", "/users");
console.log(fails ? `\n${fails} FAILED` : "\nALL PASSED");
process.exit(fails ? 1 : 0);
