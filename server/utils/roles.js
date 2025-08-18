import { ROLES } from './constants.js';

export const isPlatformUser = (role) => {
  return [
    ROLES.STUDENT,
    ROLES.TEACHER,
    ROLES.PARENT,
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN,
    ROLES.PLATFORM_USER,
  ].includes(role);
};

export const isVisitor = (role) => {
  return role === ROLES.VISITOR;
};
