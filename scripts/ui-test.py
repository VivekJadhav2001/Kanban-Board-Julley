import re, sys, time
from playwright.sync_api import sync_playwright
BASE = "http://localhost:5173"  # run: pnpm --dir frontend build && pnpm --dir frontend exec vite preview --port 5173 --strictPort
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    pg.on("console", lambda m: errs.append(f"console.{m.type}: {m.text[:140]}") if m.type == "error" else None)
    pg.on("pageerror", lambda e: errs.append(f"pageerror: {str(e)[:140]}"))
    def step(n): print("OK ", n)
    s = str(int(time.time()))
    pg.goto(BASE + "/register"); pg.get_by_label("Full name").fill("UI Test"); pg.get_by_label("Email").fill(f"ui{s}@x.com"); pg.get_by_label("Password").fill("Passw0rd!23")
    pg.get_by_role("button", name=re.compile("create|sign|register", re.I)).click(); pg.wait_for_url("**/dashboard", timeout=8000); step("register -> dashboard")
    pg.goto(BASE + "/organization/create"); pg.get_by_label("Organization Name").fill("Acme"); pg.get_by_label("Slug").fill("acme-" + s)
    pg.get_by_role("button", name=re.compile("create", re.I)).click(); pg.wait_for_url("**/dashboard", timeout=8000); step("create organization")
    pg.get_by_text("Acme").first.click(); pg.wait_for_url(re.compile(r"/organization/\w+$"), timeout=8000); org = pg.url.split("/")[-1]; step("open organization")
    pg.goto(f"{BASE}/organization/{org}/tenant/create"); pg.get_by_label("Tenant Name").fill("Team"); pg.get_by_label("Slug").fill("team-" + s)
    pg.get_by_role("button", name=re.compile("create", re.I)).click(); pg.wait_for_url(f"**/organization/{org}", timeout=8000); step("create tenant")
    pg.get_by_text("Team").first.click(); pg.wait_for_url(re.compile(r"/tenant/\w+$"), timeout=8000); ten = pg.url.split("/")[-1]; step("open tenant")
    pg.goto(f"{BASE}/tenant/{ten}/board/create"); pg.get_by_label("Board Name").fill("Roadmap")
    pg.get_by_role("button", name=re.compile("create", re.I)).click(); pg.wait_for_url(f"**/tenant/{ten}", timeout=8000); step("create board")
    pg.get_by_text("Roadmap").first.click(); pg.wait_for_url(re.compile(r"/board/\w+/\w+$"), timeout=8000); board = pg.url.split("/")[-1]; step("open board")
    pg.goto(f"{BASE}/board/{ten}/{board}/column/create"); pg.get_by_label("Column Name").fill("To Do")
    pg.get_by_role("button", name=re.compile("create", re.I)).click(); pg.wait_for_url(f"**/board/{ten}/{board}", timeout=8000); step("create column")
    pg.goto(f"{BASE}/board/{ten}/{board}/task/create"); pg.get_by_label("Task Title").fill("First task")
    pg.get_by_role("button", name=re.compile("create", re.I)).click(); pg.wait_for_url(f"**/board/{ten}/{board}", timeout=8000); step("create task")
    pg.wait_for_selector("text=First task", timeout=8000); step("task visible on board")
    print("\nBROWSER ERRORS:", errs or "none")
    b.close()
