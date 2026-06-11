import fs from 'fs'
import path from 'path'
import { createHash } from 'crypto'

const dataDir = path.join(process.cwd(), 'data')
const read = (name) => JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf-8'))
const write = (name, data) => fs.writeFileSync(path.join(dataDir, name), JSON.stringify(data, null, 2))

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex')
}

async function run() {
  const backups = {}
  try {
    // backup files
    for (const f of ['branches.json','users.json','employees.json']) {
      const p = path.join(dataDir, f)
      backups[f] = fs.readFileSync(p, 'utf-8')
    }

    // 1) create branch
    const branches = read('branches.json')
    const nextId = branches.length ? Math.max(...branches.map(b => b.id)) + 1 : 1
    const newBranch = { id: nextId, name: `Test Branch ${Date.now()}`, address: 'Test Addr', phone: '000' }
    branches.push(newBranch)
    write('branches.json', branches)

    // verify
    const branches2 = read('branches.json')
    if (!branches2.find(b => b.id === newBranch.id)) throw new Error('Branch not saved')

    // 2) create user
    const users = read('users.json')
    const newUser = { id: users.length ? Math.max(...users.map(u=>u.id))+1:1, name: 'Test User', email: `testuser+${Date.now()}@example.com`, passwordHash: hashPassword('Password123!'), role: 'employee', privileges: ['products'], branchId: newBranch.id }
    users.push(newUser)
    write('users.json', users)
    const users2 = read('users.json')
    if (!users2.find(u => u.id === newUser.id)) throw new Error('User not saved')

    // 3) create employee
    const employees = read('employees.json')
    const nextEmpId = employees.length ? Math.max(...employees.map(e=>e.id))+1 : 1
    const newEmp = { id: nextEmpId, employeeCode: `EMP-${String(nextEmpId).padStart(3,'0')}`, firstName: 'Test', lastName: 'Emp', department: 'Test', designation: 'Tester', branchName: newBranch.name, branchId: newBranch.id, status: 'active', basicSalary: '0', employmentType: 'contract', dateOfJoining: new Date().toISOString().slice(0,10), email: newUser.email, phone: '', payrollHistory: [] }
    employees.push(newEmp)
    write('employees.json', employees)
    const employees2 = read('employees.json')
    if (!employees2.find(e => e.id === newEmp.id)) throw new Error('Employee not saved')

    console.log('Persistence checks passed: branch,user,employee created successfully')

  } catch (err) {
    console.error('Persistence check failed:', err)
    process.exitCode = 2
  } finally {
    // restore backups
    for (const f of Object.keys(backups)) {
      fs.writeFileSync(path.join(dataDir, f), backups[f])
    }
  }
}

run()
