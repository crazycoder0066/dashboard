const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            hasSelection: false,
            vendorListLookupData: [],
            mainTitle: null,
            id: '',
            name: '',
            number: '',
            jobTitle: '',
            phoneNumber: '',
            emailAddress: '',
            description: '',
            vendorId: null,
            errors: {
                name: '',
                jobTitle: '',
                phoneNumber: '',
                emailAddress: '',
                vendorId: ''
            },
            isSubmitting: false
        });

        const mainModalRef = Vue.ref(null);
        const nameRef = Vue.ref(null);
        const numberRef = Vue.ref(null);
        const jobTitleRef = Vue.ref(null);
        const phoneNumberRef = Vue.ref(null);
        const emailAddressRef = Vue.ref(null);
        const vendorIdRef = Vue.ref(null);

        const showModal = () => { bootstrap.Modal.getOrCreateInstance(document.getElementById('MainModal'), { backdrop: 'static', keyboard: false }).show(); };
        const hideModal = () => { bootstrap.Modal.getInstance(document.getElementById('MainModal'))?.hide(); };

        const validateForm = function () {
            state.errors.name = ''; state.errors.jobTitle = ''; state.errors.phoneNumber = ''; state.errors.emailAddress = ''; state.errors.vendorId = '';
            let isValid = true;
            if (!state.name) { state.errors.name = 'Name is required.'; isValid = false; }
            if (!state.jobTitle) { state.errors.jobTitle = 'Job Title is required.'; isValid = false; }
            if (!state.phoneNumber) { state.errors.phoneNumber = 'Phone number is required.'; isValid = false; }
            if (!state.emailAddress) { state.errors.emailAddress = 'Email address is required.'; isValid = false; }
            if (!state.vendorId) { state.errors.vendorId = 'Vendor is required.'; isValid = false; }
            return isValid;
        };

        const resetFormState = () => {
            state.id = ''; state.name = ''; state.number = ''; state.jobTitle = ''; state.phoneNumber = '';
            state.emailAddress = ''; state.description = ''; state.vendorId = null;
            state.errors = { name: '', jobTitle: '', phoneNumber: '', emailAddress: '', vendorId: '' };
        };

        const services = {
            getMainData: async () => { try { return await AxiosManager.get('/VendorContact/GetVendorContactList', {}); } catch (e) { throw e; } },
            createMainData: async (name, jobTitle, phoneNumber, emailAddress, description, vendorId, createdById) => { try { return await AxiosManager.post('/VendorContact/CreateVendorContact', { name, jobTitle, phoneNumber, emailAddress, description, vendorId, createdById }); } catch (e) { throw e; } },
            updateMainData: async (id, name, jobTitle, phoneNumber, emailAddress, description, vendorId, updatedById) => { try { return await AxiosManager.post('/VendorContact/UpdateVendorContact', { id, name, jobTitle, phoneNumber, emailAddress, description, vendorId, updatedById }); } catch (e) { throw e; } },
            deleteMainData: async (id, deletedById) => { try { return await AxiosManager.post('/VendorContact/DeleteVendorContact', { id, deletedById }); } catch (e) { throw e; } },
            getVendorListLookupData: async () => { try { return await AxiosManager.get('/Vendor/GetVendorList', {}); } catch (e) { throw e; } },
        };

        const methods = {
            populateVendorListLookupData: async () => { const r = await services.getVendorListLookupData(); state.vendorListLookupData = r?.data?.content?.data; },
            populateMainData: async () => {
                const r = await services.getMainData();
                state.mainData = r?.data?.content?.data.map(item => ({ ...item, createdAtUtc: new Date(item.createdAtUtc) }));
            },
        };

        const nameText = { obj: null, create: () => { nameText.obj = new ej.inputs.TextBox({ placeholder: 'Enter Name' }); nameText.obj.appendTo(nameRef.value); }, refresh: () => { if (nameText.obj) nameText.obj.value = state.name; } };
        const numberText = { obj: null, create: () => { numberText.obj = new ej.inputs.TextBox({ placeholder: '[auto]', readonly: true }); numberText.obj.appendTo(numberRef.value); }, refresh: () => { if (numberText.obj) numberText.obj.value = state.number; } };
        const jobTitleText = { obj: null, create: () => { jobTitleText.obj = new ej.inputs.TextBox({ placeholder: 'Enter Job Title' }); jobTitleText.obj.appendTo(jobTitleRef.value); }, refresh: () => { if (jobTitleText.obj) jobTitleText.obj.value = state.jobTitle; } };
        const phoneNumberText = { obj: null, create: () => { phoneNumberText.obj = new ej.inputs.TextBox({ placeholder: 'Enter Phone Number' }); phoneNumberText.obj.appendTo(phoneNumberRef.value); }, refresh: () => { if (phoneNumberText.obj) phoneNumberText.obj.value = state.phoneNumber; } };
        const emailAddressText = { obj: null, create: () => { emailAddressText.obj = new ej.inputs.TextBox({ placeholder: 'Enter Email Address' }); emailAddressText.obj.appendTo(emailAddressRef.value); }, refresh: () => { if (emailAddressText.obj) emailAddressText.obj.value = state.emailAddress; } };

        const vendorListLookup = {
            obj: null,
            create: () => {
                if (state.vendorListLookupData && Array.isArray(state.vendorListLookupData)) {
                    vendorListLookup.obj = new ej.dropdowns.DropDownList({ dataSource: state.vendorListLookupData, fields: { value: 'id', text: 'name' }, placeholder: 'Select a Vendor', change: (e) => { state.vendorId = e.value; } });
                    vendorListLookup.obj.appendTo(vendorIdRef.value);
                }
            },
            refresh: () => { if (vendorListLookup.obj) vendorListLookup.obj.value = state.vendorId; }
        };

        Vue.watch(() => state.name, () => { state.errors.name = ''; nameText.refresh(); });
        Vue.watch(() => state.number, () => { numberText.refresh(); });
        Vue.watch(() => state.jobTitle, () => { state.errors.jobTitle = ''; jobTitleText.refresh(); });
        Vue.watch(() => state.phoneNumber, () => { state.errors.phoneNumber = ''; phoneNumberText.refresh(); });
        Vue.watch(() => state.emailAddress, () => { state.errors.emailAddress = ''; emailAddressText.refresh(); });
        Vue.watch(() => state.vendorId, () => { state.errors.vendorId = ''; vendorListLookup.refresh(); });

        const handler = {
            openAdd: () => { state.deleteMode = false; state.mainTitle = 'Add Vendor Contact'; resetFormState(); showModal(); },
            openEdit: () => { const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.deleteMode = false; state.mainTitle = 'Edit Vendor Contact'; mainGrid._populateState(row); showModal(); },
            openDelete: () => { const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.deleteMode = true; state.mainTitle = 'Delete Vendor Contact?'; mainGrid._populateState(row); showModal(); },
            exportExcel: () => { mainGrid.obj?.button(0).trigger(); },
            handleSubmit: async function () {
                try {
                    state.isSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 300));
                    if (!validateForm()) return;
                    const response = state.id === ''
                        ? await services.createMainData(state.name, state.jobTitle, state.phoneNumber, state.emailAddress, state.description, state.vendorId, StorageManager.getUserId())
                        : state.deleteMode ? await services.deleteMainData(state.id, StorageManager.getUserId())
                            : await services.updateMainData(state.id, state.name, state.jobTitle, state.phoneNumber, state.emailAddress, state.description, state.vendorId, StorageManager.getUserId());
                    if (response.data.code === 200) {
                        await methods.populateMainData(); mainGrid.refresh();
                        if (!state.deleteMode) {
                            state.mainTitle = 'Edit Vendor Contact';
                            const d = response?.data?.content?.data;
                            state.id = d.id ?? ''; state.number = d.number ?? ''; state.name = d.name ?? '';
                            state.jobTitle = d.jobTitle ?? ''; state.phoneNumber = d.phoneNumber ?? '';
                            state.emailAddress = d.emailAddress ?? ''; state.description = d.description ?? '';
                            state.vendorId = d.vendorId ?? '';
                        }
                        Swal.fire({ icon: 'success', title: state.deleteMode ? 'Delete Successful' : 'Save Successful', text: 'Form will be closed...', timer: 2000, showConfirmButton: false });
                        setTimeout(() => { hideModal(); if (state.deleteMode) resetFormState(); }, 2000);
                    } else { Swal.fire({ icon: 'error', title: state.deleteMode ? 'Delete Failed' : 'Save Failed', text: response.data.message ?? 'Please check your data.', confirmButtonText: 'Try Again' }); }
                } catch (error) { Swal.fire({ icon: 'error', title: 'An Error Occurred', text: error.response?.data?.message ?? 'Please try again.', confirmButtonText: 'OK' }); }
                finally { state.isSubmitting = false; }
            },
        };

        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['VendorContacts']); await SecurityManager.validateToken();
                await methods.populateMainData(); mainGrid.create(state.mainData);
                await methods.populateVendorListLookupData(); vendorListLookup.create();
                nameText.create(); numberText.create(); jobTitleText.create(); phoneNumberText.create(); emailAddressText.create();
                mainModalRef.value?.addEventListener('hidden.bs.modal', () => resetFormState());
            } catch (e) { console.error('page init error:', e); }
        });

        Vue.onUnmounted(() => { mainModalRef.value?.removeEventListener('hidden.bs.modal', resetFormState); if (mainGrid.obj) mainGrid.obj.destroy(); });

        const mainGrid = {
            obj: null,
            create: (dataSource) => {
                mainGrid.obj = new DataTable('#mainGrid', {
                    data: dataSource,
                    columns: [
                        { data: 'number', title: 'Number' },
                        { data: 'name', title: 'Name' },
                        { data: 'vendorName', title: 'Vendor' },
                        { data: 'jobTitle', title: 'Job Title' },
                        { data: 'phoneNumber', title: 'Phone' },
                        { data: 'emailAddress', title: 'Email' },
                        { data: 'createdAtUtc', title: 'Created At', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                    ],
                    order: [[6, 'desc']], pageLength: 50, lengthMenu: [[10, 25, 50, 100, -1], ['10', '25', '50', '100', 'All']],
                    select: { style: 'single', info: false },
                    buttons: [{ extend: 'excelHtml5', title: 'Vendor Contacts', exportOptions: { columns: ':visible' } }],
                    layout: { topStart: null, topEnd: { search: { placeholder: 'Search...' } }, bottomStart: 'info', bottomEnd: 'paging' }
                });
                mainGrid.obj.on('select deselect', () => { state.hasSelection = mainGrid.obj.rows({ selected: true }).count() > 0; });
            },
            refresh: () => { mainGrid.obj.clear().rows.add(state.mainData).draw(); },
            _populateState: (row) => {
                state.id = row.id ?? ''; state.number = row.number ?? ''; state.name = row.name ?? '';
                state.jobTitle = row.jobTitle ?? ''; state.phoneNumber = row.phoneNumber ?? '';
                state.emailAddress = row.emailAddress ?? ''; state.description = row.description ?? '';
                state.vendorId = row.vendorId ?? '';
            }
        };

        return { mainModalRef, nameRef, numberRef, jobTitleRef, phoneNumberRef, emailAddressRef, vendorIdRef, state, handler };
    }
};

Vue.createApp(App).mount('#app');
