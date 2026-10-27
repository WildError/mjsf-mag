import test from 'node:test'
import assert from 'node:assert/strict'
import { createPinia, setActivePinia } from 'pinia'
import { effectScope, ref } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { useAuthStore } from '../src/stores/auth.js'
import { useProductsStore } from '../src/stores/products.js'
import { usePrivateResource } from '../src/composables/usePrivateResource.js'
import { validateDraft } from '../src/api/productDraft.js'
import { SESSION_KEY } from '../src/auth/session.js'
import { safeRedirect } from '../src/router/guards.js'
const response = (data, status = 200) => new Response(JSON.stringify(data), { status })
const user = { id: 1, username: 'demo', firstName: 'Demo', lastName: 'User' }
const fields = { title: 'Changed', price: 20, stock: 3, description: 'Description' }
function setup() {
  setActivePinia(createPinia())
  const storage = new Map()
  globalThis.sessionStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key),
  }
  return { auth: useAuthStore(), products: useProductsStore(), storage }
}
async function enter(auth, token = 'test-token') {
  globalThis.fetch = async () => response({ ...user, accessToken: token, refreshToken: 'not-stored' })
  assert.equal(await auth.login('demo', 'test'), true)
}
const deferred = () => {
  let resolve
  const promise = new Promise(r => { resolve = r })
  return { promise, resolve }
}
const tick = () => new Promise(r => setTimeout(r, 0))

test('validation: trims; rejects empty numbers, zero price, fractional stock and excessive lengths', () => {
  assert.equal(validateDraft(fields).valid, true)
  assert.equal(validateDraft({ ...fields, title: '  Name  ' }).values.title, 'Name')
  for (const [field, value] of [['title',' '],['title','a'.repeat(121)],['price',''],['price',0],['price',Infinity],['stock',''],['stock',-1],['stock',1.5],['description',''],['description','a'.repeat(2001)]])
    assert.ok(validateDraft({ ...fields, [field]: value }).errors[field])
})
test('login is single-flight and persists only access token; failed login creates no session', async () => {
  const { auth, storage } = setup()
  const d = deferred()
  let calls = 0
  globalThis.fetch = () => { calls++; return d.promise }
  const first = auth.login('demo', 'test')
  assert.equal(await auth.login('demo', 'test'), false)
  assert.equal(calls, 1)
  d.resolve(response({ ...user, accessToken: 'ok', refreshToken: 'ignored' }))
  assert.equal(await first, true)
  assert.deepEqual([...storage.keys()], [SESSION_KEY])
  assert.equal('refreshToken' in auth.user, false)
  auth.logout()
  globalThis.fetch = async () => response({}, 400)
  assert.equal(await auth.login('demo', 'wrong'), false)
  assert.equal(auth.status, 'guest')
  assert.equal(storage.size, 0)
})
test('restore is deduplicated and cached; offline preserves token; retry works; 401 removes token', async () => {
  const { auth, storage } = setup()
  storage.set(SESSION_KEY, 'stored')
  let calls = 0
  const d = deferred()
  globalThis.fetch = () => { calls++; return d.promise }
  const a = auth.restore(), b = auth.restore()
  d.resolve(response(user))
  await Promise.all([a,b])
  await auth.restore()
  assert.equal(calls,1)
  assert.equal(auth.isAuthenticated,true)
  globalThis.fetch = async () => { throw new TypeError('offline') }
  await auth.restore(true)
  assert.equal(auth.status,'unavailable')
  assert.equal(auth.isAuthenticated,false)
  assert.equal(storage.get(SESSION_KEY),'stored')
  globalThis.fetch = async () => response(user)
  assert.equal(await auth.restore(true),true)
  globalThis.fetch = async () => response({},401)
  await auth.restore(true)
  assert.equal(auth.status,'guest')
  assert.equal(storage.size,0)
})
test('late login and restore cannot resurrect a logged out session', async () => {
  for (const kind of ['login','restore']) {
    const { auth, storage } = setup()
    const d = deferred()
    storage.set(SESSION_KEY,'old')
    globalThis.fetch = () => d.promise
    const pending = kind === 'login' ? auth.login('demo','test') : auth.restore()
    auth.logout()
    d.resolve(response({ ...user, accessToken:'late' }))
    await pending
    assert.equal(auth.status,'guest')
    assert.equal(auth.accessToken,'')
  }
})
test('PATCH commits only after success, sends four fields, prevents duplicates, resets on logout', async () => {
  const { auth, products } = setup()
  await enter(auth)
  const d = deferred()
  let calls = 0, options
  globalThis.fetch = (url, opts) => { calls++; options=opts; return d.promise }
  const pending = products.save('12', { ...fields, id:999, extra:true })
  assert.deepEqual(products.confirmed,{})
  assert.equal(await products.save('12',fields),null)
  assert.equal(calls,1)
  assert.deepEqual(Object.keys(JSON.parse(options.body)).sort(),Object.keys(fields).sort())
  assert.equal(options.credentials,'omit')
  d.resolve(response({ id:12,...fields }))
  assert.deepEqual(await pending,fields)
  assert.equal(products.displayProduct({id:12,title:'old'}).title,'Changed')
  auth.logout()
  assert.deepEqual(products.confirmed,{})
})
test('failed save preserves confirmed data and late PATCH never changes a new session', async () => {
  const { auth, products } = setup()
  await enter(auth)
  products.confirmed={12:{...fields}}
  globalThis.fetch=async()=>response({},500)
  assert.equal(await products.save('12',{...fields,title:'bad'}),null)
  assert.equal(products.confirmed[12].title,'Changed')
  const d=deferred()
  globalThis.fetch=()=>d.promise
  const pending=products.save('12',fields)
  auth.logout()
  await enter(auth,'new')
  d.resolve(response({id:12,...fields}))
  assert.equal(await pending,null)
  assert.deepEqual(products.confirmed,{})
  assert.equal(auth.accessToken,'new')
})
test('old request 401 cannot terminate new login; current 401 clears session and overrides', async () => {
  const {auth,products}=setup()
  await enter(auth,'old')
  const d=deferred()
  globalThis.fetch=()=>d.promise
  const pending=auth.request('/auth/products').catch(e=>e)
  auth.logout()
  await enter(auth,'new')
  d.resolve(response({},401))
  await pending
  assert.equal(auth.isAuthenticated,true)
  products.confirmed={12:fields}
  globalThis.fetch=async()=>response({},401)
  await auth.request('/auth/products').catch(()=>{})
  assert.equal(auth.status,'guest')
  assert.deepEqual(products.confirmed,{})
})
test('private composable clears old data and ignores late source/unmount responses', async () => {
  const {auth}=setup()
  await enter(auth)
  const requests=[]
  globalThis.fetch=()=>{const d=deferred();requests.push(d);return d.promise}
  const scope=effectScope(), path=ref('/auth/products/1')
  const resource=scope.run(()=>usePrivateResource(path))
  path.value='/auth/products/2'
  requests[1].resolve(response({id:2}))
  await tick()
  requests[0].resolve(response({id:1}))
  await tick()
  assert.equal(resource.data.value.id,2)
  path.value='/auth/products/3'
  assert.equal(resource.data.value,null)
  scope.stop()
  requests[2].resolve(response({id:3}))
  await tick()
  assert.equal(resource.data.value,null)
})
test('redirect only permits recognized internal management targets', () => {
  const router=createRouter({history:createMemoryHistory(),routes:[
    {path:'/manage/products',name:'manage-products',component:{}},
    {path:'/manage/products/:id/edit',name:'manage-edit',component:{}},
    {path:'/login',name:'login',component:{}},
  ]})
  assert.equal(safeRedirect(router,'/manage/products/12/edit?q=phone'),'/manage/products/12/edit?q=phone')
  for (const target of ['https://example.com','//example.com','/login','/unknown','/\\example.com', ['x']])
    assert.deepEqual(safeRedirect(router,target),{name:'manage-products'})
})
