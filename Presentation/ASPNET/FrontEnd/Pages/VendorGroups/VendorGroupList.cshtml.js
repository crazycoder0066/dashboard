const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            hasSelection: false,
            mainTitle: null,
            id: '',
            name: '',
            description: '',
            errors: { name: '' },
            isSubmitting: false
        });

        const mainModalRef = Vue.ref(null);
        const nameRef = Vue.ref(null);

        const showModal = () => { bootstrap.Modal.getOrCreateInstance(document.getElementById('MainModal'), { backdrop: 'static', keyboard: false }).show(); };
        const hideModal = () => { bootstrap.Modal.getInstance(document.getElementById('MainModal'))?.hide(); };

        const nameText = { obj: null, create: () => { nameText.obj = new ej.inputs.TextBox({ placeholder: 'Enter Name' }); nameText.obj.appendTo(nameRef.value); }, refresh: () => { if (nameText.obj) nameText.obj.value = state.name; } };
        Vue.watch(() => state.name, () => { state.errors.name = ''; nameText.refresh(); });

        const validateForm = () => { state.errors.name = ''; if (!state.name) { state.errors.name = 'Name is required.'; return false; } return true; };
        const resetFormState = () => { state.id = ''; state.name = ''; state.description = ''; state.errors = { name: '' }; };

        const services = {
            getMainData: async () => { try { return await AxiosManager.get('/VendorGroup/GetVendorGroupList', {}); } catch (e) { throw e; } },
            createMainData: async (name, description, createdById) => { try { return await AxiosManager.post('/VendorGroup/CreateVendorGroup', { name, description, createdById }); } catch (e) { throw e; } },
            updateMainData: async (id, name, description, updatedById) => { try { return await AxiosManager.post('/VendorGroup/UpdateVendorGroup', { id, name, description, updatedById }); } catch (e) { throw e; } },
            deleteMainData: async (id, deletedById) => { try { return await AxiosManager.post('/VendorGroup/DeleteVendorGroup', { id, deletedById }); } catch (e) { throw e; } },
        };

        const methods = {
            populateMainData: async () => {
                const r = await services.getMainData();
                state.mainData = r?.data?.content?.data.map(item => ({ ...item, createdAtUtc: new Date(item.createdAtUtc) }));
            },
        };

        const handler = {
            openAdd: () => { state.deleteMode = false; state.mainTitle = 'Add Vendor Group'; resetFormState(); showModal(); },
            openEdit: () => { const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.deleteMode = false; state.mainTitle = 'Edit Vendor Group'; mainGrid._populateState(row); showModal(); },
            openDelete: () => { const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.deleteMode = true; state.mainTitle = 'Delete Vendor Group?'; mainGrid._populateState(row); showModal(); },
            exportExcel: () => { mainGrid.obj?.button(0).trigger(); },
            handleSubmit: async function () {
                try {
                    state.isSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 300));
                    if (!validateForm()) return;
                    const response = state.id === ''
                        ? await services.createMainData(state.name, state.description, StorageManager.getUserId())
                        : state.deleteMode ? await services.deleteMainData(state.id, StorageManager.getUserId())
                            : await services.updateMainData(state.id, state.name, state.description, StorageManager.getUserId());
                    if (response.data.code === 200) {
                        await methods.populateMainData(); mainGrid.refresh();
                        if (!state.deleteMode) { state.mainTitle = 'Edit Vendor Group'; state.id = response?.data?.content?.data.id ?? ''; state.name = response?.data?.content?.data.name ?? ''; state.description = response?.data?.content?.data.description ?? ''; }
                        Swal.fire({ icon: 'success', title: state.deleteMode ? 'Delete Successful' : 'Save Successful', text: 'Form will be closed...', timer: 2000, showConfirmButton: false });
                        setTimeout(() => { hideModal(); if (state.deleteMode) resetFormState(); }, 2000);
                    } else { Swal.fire({ icon: 'error', title: state.deleteMode ? 'Delete Failed' : 'Save Failed', text: response.data.message ?? 'Please check your data.', confirmButtonText: 'Try Again' }); }
                } catch (error) { Swal.fire({ icon: 'error', title: 'An Error Occurred', text: error.response?.data?.message ?? 'Please try again.', confirmButtonText: 'OK' }); }
                finally { state.isSubmitting = false; }
            },
        };

        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['VendorGroups']); await SecurityManager.validateToken();
                await methods.populateMainData(); mainGrid.create(state.mainData);
                nameText.create();
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
                        { data: 'name', title: 'Name' },
                        { data: 'description', title: 'Description' },
                        { data: 'createdAtUtc', title: 'Created At', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                    ],
                    order: [[2, 'desc']], pageLength: 50, lengthMenu: [[10, 25, 50, 100, -1], ['10', '25', '50', '100', 'All']],
                    select: { style: 'single', info: false },
                    buttons: [{ extend: 'excelHtml5', title: 'Vendor Groups', exportOptions: { columns: ':visible' } }],
                    layout: { topStart: null, topEnd: { search: { placeholder: 'Search...' } }, bottomStart: 'info', bottomEnd: 'paging' }
                });
                mainGrid.obj.on('select deselect', () => { state.hasSelection = mainGrid.obj.rows({ selected: true }).count() > 0; });
            },
            refresh: () => { mainGrid.obj.clear().rows.add(state.mainData).draw(); },
            _populateState: (row) => { state.id = row.id ?? ''; state.name = row.name ?? ''; state.description = row.description ?? ''; }
        };

        return { mainModalRef, nameRef, state, handler };
    }
};

Vue.createApp(App).mount('#app');
