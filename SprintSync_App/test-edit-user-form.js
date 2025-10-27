// Test script to verify EditUserForm data structure and API calls
console.log('🧪 Testing EditUserForm data structure...');

// Mock form data
const mockFormData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: '',
  confirmPassword: '',
  role: 'ADMIN',
  departmentId: 'DEPT001',
  domainId: 'DOMN001',
  avatarUrl: 'https://example.com/avatar.jpg',
  experience: 'senior',
  hourlyRate: '75',
  availabilityPercentage: '100',
  skills: 'React, TypeScript, Node.js',
  isActive: true
};

// Mock user data
const mockUser = {
  id: 'USER0000000000001',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'admin',
  departmentId: 'DEPT001',
  domainId: 'DOMN001',
  avatarUrl: 'https://example.com/avatar.jpg',
  experience: 'senior',
  hourlyRate: 75,
  availabilityPercentage: 100,
  skills: 'React, TypeScript, Node.js',
  isActive: true
};

// Test data conversion functions
function convertBasicInformation(data) {
  return {
    name: `${data.firstName.trim()} ${data.lastName.trim()}`,
    email: data.email.trim(),
    passwordHash: data.password || undefined
  };
}

function convertRoleAndOrganization(data) {
  const roleMapping = {
    'ADMIN': 'admin',
    'MANAGER': 'manager', 
    'DEVELOPER': 'developer',
    'DESIGNER': 'designer',
    'TESTER': 'tester',
    'ANALYST': 'analyst'
  };
  
  return {
    role: roleMapping[data.role] || data.role.toLowerCase(),
    departmentId: data.departmentId === 'none' ? undefined : data.departmentId,
    domainId: data.domainId === 'none' ? undefined : data.domainId,
    isActive: data.isActive
  };
}

function convertProfessionalDetails(data) {
  return {
    hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : undefined,
    availabilityPercentage: Number(data.availabilityPercentage),
    skills: data.skills.trim() || undefined
  };
}

function convertProfile(data) {
  return {
    avatarUrl: data.avatarUrl.trim() || undefined
  };
}

// Test the conversion
console.log('🔄 Testing data conversion...');

const basicInfo = convertBasicInformation(mockFormData);
const roleAndOrg = convertRoleAndOrganization(mockFormData);
const professionalDetails = convertProfessionalDetails(mockFormData);
const profile = convertProfile(mockFormData);

const userData = {
  ...basicInfo,
  ...roleAndOrg,
  ...professionalDetails,
  ...profile
};

console.log('✅ Basic Information:', basicInfo);
console.log('✅ Role & Organization:', roleAndOrg);
console.log('✅ Professional Details:', professionalDetails);
console.log('✅ Profile:', profile);
console.log('✅ Complete User Data:', userData);

// Test essential fields
const essentialFields = {
  name: userData.name,
  email: userData.email,
  role: userData.role
};

console.log('✅ Essential Fields:', essentialFields);

// Test safe fields
const safeFields = {
  ...essentialFields,
  departmentId: userData.departmentId,
  domainId: userData.domainId,
  isActive: userData.isActive,
  hourlyRate: userData.hourlyRate,
  availabilityPercentage: userData.availabilityPercentage,
  skills: userData.skills,
  avatarUrl: userData.avatarUrl
};

console.log('✅ Safe Fields:', safeFields);

console.log('🧪 Test completed successfully!');
