const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            secondaryData: [],
            deleteMode: false,
            hasSelection: false,
            mainTitle: null,
            changePasswordTitle: null,
            changeRoleTitle: null,
            id: '',
            firstName: '',
            lastName: '',
            email: '',
            emailConfirmed: false,
            isBlocked: false,
            isDeleted: false,
            password: '',
            confirmPassword: '',
            newPassword: '',
            userId: '',
            errors: {
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                confirmPassword: '',
                newPassword: '',
            },
            isSubmitting: false,
            isChangePasswordSubmitting: false,
        });

        const mainModalRef = Vue.ref(null);
        const changePasswordModalRef = Vue.ref(null);
        const changeRoleModalRef = Vue.ref(null);
        const firstNameRef = Vue.ref(null);
        const lastNameRef = Vue.ref(null);
        const emailRef = Vue.ref(null);

        const showModal = () => { bootstrap.Modal.getOrCreateInstance(document.getElementById('MainModal'), { backdrop: 'static', keyboard: false }).show(); };
        const hideModal = () => { bootstrap.Modal.getInstance(document.getElementById('MainModal'))?.hide(); };

        const firstNameText = { obj: null, create: () => { firstNameText.obj = new ej.inputs.TextBox({ placeholder: 'Enter First Name' }); firstNameText.obj.appendTo(firstNameRef.value); }, refresh: () => { if (firstNameText.obj) firstNameText.obj.value = state.firstName; } };
        const lastNameText = { obj: null, create: () => { lastNameText.obj = new ej.inputs.TextBox({ placeholder: 'Enter Last Name' }); lastNameText.obj.appendTo(lastNameRef.value); }, refresh: () => { if (lastNameText.obj) lastNameText.obj.value = state.lastName; } };
        const emailText = { obj: null, create: () => { emailText.obj = new ej.inputs.TextBox({ placeholder: 'Enter Email' }); emailText.obj.appendTo(emailRef.value); }, refresh: () => { if (emailText.obj) emailText.obj.value = state.email; } };

        Vue.watch(() => state.firstName, () => { state.errors.firstName = ''; firstNameText.refresh(); });
        Vue.watch(() => state.lastName, () => { state.errors.lastName = ''; lastNameText.refresh(); });
        Vue.watch(() => state.email, () => { state.errors.email = ''; emailText.refresh(); });

        const validateForm = function () {
            state.errors.firstName = ''; state.errors.lastName = ''; state.errors.email = '';
            state.errors.password = ''; state.errors.confirmPassword = '';
            let isValid = true;
            if (!state.firstName) { state.errors.firstName = 'First Name is required.'; isValid = false; }
            if (!state.lastName) { state.errors.lastName = 'Last Name is required.'; isValid = false; }
            if (!state.email) { state.errors.email = 'Email is required.'; isValid = false; }
            else if (!/\S+@\S+\.\S+/.test(state.email)) { state.errors.email = 'Please enter a valid email address.'; isValid = false; }
            if (state.id === '') {
                if (!state.password) { state.errors.password = 'Password is required.'; isValid = false; }
                if (!state.confirmPassword) { state.errors.confirmPassword = 'Confirm Password is required.'; isValid = false; }
                if (state.password && state.confirmPassword && state.password !== state.confirmPassword) { state.errors.confirmPassword = 'Password and Confirm Password must match.'; isValid = false; }
            }
            return isValid;
        };

        const validateChangePasswordForm = function () {
            state.errors.newPassword = '';
            let isValid = true;
            if (!state.newPassword) { state.errors.newPassword = 'New Password is required.'; isValid = false; }
            else if (state.newPassword.length < 6) { state.errors.newPassword = 'New Password must be at least 6 characters.'; isValid = false; }
            return isValid;
        };

        const resetFormState = () => {
            state.id = ''; state.firstName = ''; state.lastName = ''; state.email = '';
            state.emailConfirmed = false; state.isBlocked = false; state.isDeleted = false;
            state.password = ''; state.confirmPassword = '';
            state.errors = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' };
        };

        const resetChangePasswordFormState = () => { state.newPassword = ''; state.errors = { newPassword: '' }; };

        const services = {
            getMainData: async () => { try { return await AxiosManager.get('/Security/GetUserList', {}); } catch (e) { throw e; } },
            createMainData: async (firstName, lastName, email, emailConfirmed, isBlocked, isDeleted, password, confirmPassword, createdById) => { try { return await AxiosManager.post('/Security/CreateUser', { firstName, lastName, email, emailConfirmed, isBlocked, isDeleted, password, confirmPassword, createdById }); } catch (e) { throw e; } },
            updateMainData: async (userId, firstName, lastName, emailConfirmed, isBlocked, isDeleted, updatedById) => { try { return await AxiosManager.post('/Security/UpdateUser', { userId, firstName, lastName, emailConfirmed, isBlocked, isDeleted, updatedById }); } catch (e) { throw e; } },
            deleteMainData: async (userId, deletedById) => { try { return await AxiosManager.post('/Security/DeleteUser', { userId, deletedById }); } catch (e) { throw e; } },
            updatePasswordData: async (userId, newPassword) => { try { return await AxiosManager.post('/Security/UpdatePasswordUser', { userId, newPassword }); } catch (e) { throw e; } },
            getRolesData: async () => { try { return await AxiosManager.get('/Security/GetRoleList', {}); } catch (e) { throw e; } },
            getUserRolesData: async (userId) => { try { if (!userId || userId.trim() === '') return null; return await AxiosManager.post('/Security/GetUserRoles', { userId }); } catch (e) { throw e; } },
            updateUserRoleData: async (userId, roleName, accessGranted) => { try { return await AxiosManager.post('/Security/UpdateUserRole', { userId, roleName, accessGranted }); } catch (e) { throw e; } },
        };

        const methods = {
            populateMainData: async () => {
                try {
                    const r = await services.getMainData();
                    state.mainData = r?.data?.content?.data.map(item => ({ ...item, createdAt: new Date(item.createdAt) }));
                } catch (e) { console.error('Error populating main data:', e); state.mainData = []; }
            },
            populateSecondaryData: async (userId) => {
                try {
                    const rolesResponse = await services.getRolesData();
                    const roles = rolesResponse?.data?.content?.data ?? [];
                    const userRolesResponse = await services.getUserRolesData(userId);
                    const userRoles = userRolesResponse?.data?.content?.data ?? [];
                    state.secondaryData = roles.length === 0 ? [] : roles.map(role => ({ roleName: role.name, accessGranted: userRoles.includes(role.name) }));
                } catch (e) { console.error('Error populating secondary data:', e); state.secondaryData = []; }
            },
        };

        const handler = {
            openAdd: () => { state.deleteMode = false; state.mainTitle = 'Add User'; resetFormState(); showModal(); },
            openEdit: () => { const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.deleteMode = false; state.mainTitle = 'Edit User'; mainGrid._populateState(row); showModal(); },
            openDelete: () => { const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.deleteMode = true; state.mainTitle = 'Delete User?'; mainGrid._populateState(row); showModal(); },
            openChangePassword: () => { const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.changePasswordTitle = 'Change Password'; state.userId = row.id ?? ''; bootstrap.Modal.getOrCreateInstance(document.getElementById('ChangePasswordModal'), { backdrop: 'static', keyboard: false }).show(); },
            openChangeRole: async () => { const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.changeRoleTitle = 'Change Roles'; state.userId = row.id ?? ''; await methods.populateSecondaryData(state.userId); secondaryGrid.refresh(); bootstrap.Modal.getOrCreateInstance(document.getElementById('ChangeRoleModal'), { backdrop: 'static', keyboard: false }).show(); },
            exportExcel: () => { mainGrid.obj?.button(0).trigger(); },
            handleSubmit: async function () {
                try {
                    state.isSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 300));
                    if (!validateForm()) return;
                    const response = state.id === ''
                        ? await services.createMainData(state.firstName, state.lastName, state.email, state.emailConfirmed, state.isBlocked, state.isDeleted, state.password, state.confirmPassword, StorageManager.getUserId())
                        : state.deleteMode ? await services.deleteMainData(state.id, StorageManager.getUserId())
                            : await services.updateMainData(state.id, state.firstName, state.lastName, state.emailConfirmed, state.isBlocked, state.isDeleted, StorageManager.getUserId());
                    if (response.data.code === 200) {
                        await methods.populateMainData(); mainGrid.refresh();
                        if (!state.deleteMode) {
                            state.mainTitle = 'Edit User';
                            const d = response?.data?.content?.data;
                            state.id = d.userId ?? ''; state.firstName = d.firstName ?? ''; state.lastName = d.lastName ?? '';
                            state.email = d.email ?? ''; state.emailConfirmed = d.emailConfirmed ?? false;
                            state.isBlocked = d.isBlocked ?? false; state.isDeleted = d.isDeleted ?? false;
                        }
                        Swal.fire({ icon: 'success', title: state.deleteMode ? 'Delete Successful' : 'Save Successful', text: 'Form will be closed...', timer: 2000, showConfirmButton: false });
                        setTimeout(() => { hideModal(); if (state.deleteMode) resetFormState(); }, 2000);
                    } else { Swal.fire({ icon: 'error', title: state.deleteMode ? 'Delete Failed' : 'Save Failed', text: response.data.message ?? 'Please check your data.', confirmButtonText: 'Try Again' }); }
                } catch (error) { Swal.fire({ icon: 'error', title: 'An Error Occurred', text: error.response?.data?.message ?? 'Please try again.', confirmButtonText: 'OK' }); }
                finally { state.isSubmitting = false; }
            },
            handleChangePassword: async function () {
                try {
                    state.isChangePasswordSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 300));
                    if (!validateChangePasswordForm()) return;
                    const response = await services.updatePasswordData(state.userId, state.newPassword);
                    if (response.data.code === 200) {
                        Swal.fire({ icon: 'success', title: 'Save Successful', text: 'Password has been updated.', timer: 2000, showConfirmButton: false });
                        setTimeout(() => { bootstrap.Modal.getInstance(document.getElementById('ChangePasswordModal'))?.hide(); resetChangePasswordFormState(); }, 2000);
                    } else { Swal.fire({ icon: 'error', title: 'Save Failed', text: response.data.message ?? 'Please check your data.', confirmButtonText: 'Try Again' }); }
                } catch (error) { Swal.fire({ icon: 'error', title: 'An Error Occurred', text: error.response?.data?.message ?? 'Please try again.', confirmButtonText: 'OK' }); }
                finally { state.isChangePasswordSubmitting = false; }
            },
        };

        const changePasswordModal = { obj: null, create: () => { changePasswordModal.obj = new bootstrap.Modal(changePasswordModalRef.value, { backdrop: 'static', keyboard: false }); } };
        const changeRoleModal = { obj: null, create: () => { changeRoleModal.obj = new bootstrap.Modal(changeRoleModalRef.value, { backdrop: 'static', keyboard: false }); } };

        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['Users']); await SecurityManager.validateToken();
                await methods.populateMainData(); mainGrid.create(state.mainData);
                secondaryGrid.create([]);
                firstNameText.create(); lastNameText.create(); emailText.create();
                changePasswordModal.create(); changeRoleModal.create();
                mainModalRef.value?.addEventListener('hidden.bs.modal', () => resetFormState());
                changePasswordModalRef.value?.addEventListener('hidden.bs.modal', () => resetChangePasswordFormState());
            } catch (e) { console.error('page init error:', e); }
        });

        Vue.onUnmounted(() => {
            mainModalRef.value?.removeEventListener('hidden.bs.modal', resetFormState);
            changePasswordModalRef.value?.removeEventListener('hidden.bs.modal', resetChangePasswordFormState);
            if (mainGrid.obj) mainGrid.obj.destroy();
            if (secondaryGrid.obj) secondaryGrid.obj.destroy();
        });

        const mainGrid = {
            obj: null,
            create: (dataSource) => {
                mainGrid.obj = new DataTable('#mainGrid', {
                    data: dataSource,
                    columns: [
                        { data: 'firstName', title: 'First Name' },
                        { data: 'lastName', title: 'Last Name' },
                        { data: 'email', title: 'Email' },
                        { data: 'emailConfirmed', title: 'Email Confirmed', className: 'text-center', render: d => d ? '<i class="ti ti-check text-success"></i>' : '<span class="text-muted">—</span>' },
                        { data: 'isBlocked', title: 'Blocked', className: 'text-center', render: d => d ? '<i class="ti ti-check text-danger"></i>' : '<span class="text-muted">—</span>' },
                        { data: 'isDeleted', title: 'Deleted', className: 'text-center', render: d => d ? '<i class="ti ti-check text-danger"></i>' : '<span class="text-muted">—</span>' },
                        { data: 'createdAt', title: 'Created At', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                    ],
                    order: [[6, 'desc']], pageLength: 50, lengthMenu: [[10, 25, 50, 100, -1], ['10', '25', '50', '100', 'All']],
                    select: { style: 'single', info: false },
                    buttons: [{ extend: 'excelHtml5', title: 'Users', exportOptions: { columns: ':visible' } }],
                    layout: { topStart: null, topEnd: { search: { placeholder: 'Search...' } }, bottomStart: 'info', bottomEnd: 'paging' }
                });
                mainGrid.obj.on('select deselect', () => { state.hasSelection = mainGrid.obj.rows({ selected: true }).count() > 0; });
            },
            refresh: () => { mainGrid.obj.clear().rows.add(state.mainData).draw(); },
            _populateState: (row) => {
                state.id = row.id ?? ''; state.firstName = row.firstName ?? ''; state.lastName = row.lastName ?? '';
                state.email = row.email ?? ''; state.emailConfirmed = row.emailConfirmed ?? false;
                state.isBlocked = row.isBlocked ?? false; state.isDeleted = row.isDeleted ?? false;
            }
        };

        const secondaryGrid = {
            obj: null,
            create: (dataSource) => {
                secondaryGrid.obj = new DataTable('#secondaryGrid', {
                    data: dataSource,
                    columns: [
                        { data: 'roleName', title: 'Role' },
                        {
                            data: 'accessGranted',
                            title: 'Access Granted',
                            className: 'text-center',
                            render: (d, type, row) => {
                                if (type === 'display') {
                                    return `<input type="checkbox" class="form-check-input role-toggle" data-role="${row.roleName}" ${d ? 'checked' : ''}>`;
                                }
                                return d;
                            }
                        },
                    ],
                    order: [[0, 'asc']], pageLength: 100,
                    paging: false, searching: false, info: false,
                    layout: { topStart: null, topEnd: null, bottomStart: null, bottomEnd: null }
                });

                document.getElementById('secondaryGrid')?.addEventListener('change', async (e) => {
                    if (e.target.classList.contains('role-toggle')) {
                        const roleName = e.target.dataset.role;
                        const accessGranted = e.target.checked;
                        try {
                            const response = await services.updateUserRoleData(state.userId, roleName, accessGranted);
                            if (response.data.code === 200) {
                                await methods.populateSecondaryData(state.userId);
                                secondaryGrid.refresh();
                            } else {
                                e.target.checked = !accessGranted;
                                Swal.fire({ icon: 'error', title: 'Save Failed', text: response.data.message ?? 'Please try again.', confirmButtonText: 'OK' });
                            }
                        } catch (error) {
                            e.target.checked = !accessGranted;
                            Swal.fire({ icon: 'error', title: 'An Error Occurred', text: error.response?.data?.message ?? 'Please try again.', confirmButtonText: 'OK' });
                        }
                    }
                });
            },
            refresh: () => { secondaryGrid.obj.clear().rows.add(state.secondaryData).draw(); },
        };

        return {
            mainModalRef, changePasswordModalRef, changeRoleModalRef,
            firstNameRef, lastNameRef, emailRef,
            state, handler,
        };
    }
};

Vue.createApp(App).mount('#app');
