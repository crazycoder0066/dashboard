const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            hasSelection: false,
            mainTitle: null,
            id: '',
            name: '',
            percentage: '',
            description: '',
            errors: {
                name: '',
                percentage: '',
                description: ''
            },
            isSubmitting: false,
        });

        const mainModalRef = Vue.ref(null);
        const nameRef = Vue.ref(null);
        const percentageRef = Vue.ref(null);

        const showModal = () => {
            bootstrap.Modal.getOrCreateInstance(document.getElementById('MainModal'), { backdrop: 'static', keyboard: false }).show();
        };
        const hideModal = () => {
            bootstrap.Modal.getInstance(document.getElementById('MainModal'))?.hide();
        };

        const services = {
            getMainData: async () => {
                try { return await AxiosManager.get('/Tax/GetTaxList', {}); } catch (error) { throw error; }
            },
            createMainData: async (name, percentage, description, createdById) => {
                try { return await AxiosManager.post('/Tax/CreateTax', { name, percentage, description, createdById }); } catch (error) { throw error; }
            },
            updateMainData: async (id, name, percentage, description, updatedById) => {
                try { return await AxiosManager.post('/Tax/UpdateTax', { id, name, percentage, description, updatedById }); } catch (error) { throw error; }
            },
            deleteMainData: async (id, deletedById) => {
                try { return await AxiosManager.post('/Tax/DeleteTax', { id, deletedById }); } catch (error) { throw error; }
            },
        };

        const methods = {
            populateMainData: async () => {
                const response = await services.getMainData();
                state.mainData = response?.data?.content?.data.map(item => ({ ...item, createdAtUtc: new Date(item.createdAtUtc) }));
            }
        };

        const nameText = {
            obj: null,
            create: () => { nameText.obj = new ej.inputs.TextBox({ placeholder: 'Enter Name' }); nameText.obj.appendTo(nameRef.value); },
            refresh: () => { if (nameText.obj) nameText.obj.value = state.name; }
        };

        const percentageText = {
            obj: null,
            create: () => {
                percentageText.obj = new ej.inputs.NumericTextBox({ placeholder: 'Enter Percentage', format: 'n2', min: 0, max: 100, step: 0.01 });
                percentageText.obj.appendTo(percentageRef.value);
            },
            refresh: () => { if (percentageText.obj) percentageText.obj.value = parseFloat(state.percentage); }
        };

        const validateForm = function () {
            state.errors.name = ''; state.errors.percentage = ''; state.errors.description = '';
            let isValid = true;
            if (!state.name) { state.errors.name = 'Name is required.'; isValid = false; }
            if (!state.percentage || isNaN(parseFloat(state.percentage))) {
                state.errors.percentage = 'Percentage is required and must be a number.'; isValid = false;
            } else if (parseFloat(state.percentage) < 0 || parseFloat(state.percentage) > 100) {
                state.errors.percentage = 'Percentage must be between 0 and 100.'; isValid = false;
            }
            return isValid;
        };

        const resetFormState = () => {
            state.id = ''; state.name = ''; state.percentage = ''; state.description = '';
            state.errors = { name: '', percentage: '', description: '' };
        };

        Vue.watch(() => state.name, () => { state.errors.name = ''; nameText.refresh(); });
        Vue.watch(() => state.percentage, () => { state.errors.percentage = ''; percentageText.refresh(); });

        const handler = {
            openAdd: () => { state.deleteMode = false; state.mainTitle = 'Add Tax'; resetFormState(); showModal(); },
            openEdit: () => { const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.deleteMode = false; state.mainTitle = 'Edit Tax'; mainGrid._populateState(row); showModal(); },
            openDelete: () => { const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.deleteMode = true; state.mainTitle = 'Delete Tax?'; mainGrid._populateState(row); showModal(); },
            exportExcel: () => { mainGrid.obj?.button(0).trigger(); },
            handleSubmit: async function () {
                try {
                    state.isSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 300));
                    if (!validateForm()) return;

                    const response = state.id === ''
                        ? await services.createMainData(state.name, state.percentage, state.description, StorageManager.getUserId())
                        : state.deleteMode
                            ? await services.deleteMainData(state.id, StorageManager.getUserId())
                            : await services.updateMainData(state.id, state.name, state.percentage, state.description, StorageManager.getUserId());

                    if (response.data.code === 200) {
                        await methods.populateMainData();
                        mainGrid.refresh();
                        Swal.fire({ icon: 'success', title: state.deleteMode ? 'Delete Successful' : 'Save Successful', text: 'Form will be closed...', timer: 2000, showConfirmButton: false });
                        setTimeout(() => { hideModal(); if (state.deleteMode) resetFormState(); }, 2000);
                    } else {
                        Swal.fire({ icon: 'error', title: state.deleteMode ? 'Delete Failed' : 'Save Failed', text: response.data.message ?? 'Please check your data.', confirmButtonText: 'Try Again' });
                    }
                } catch (error) {
                    Swal.fire({ icon: 'error', title: 'An Error Occurred', text: error.response?.data?.message ?? 'Please try again.', confirmButtonText: 'OK' });
                } finally {
                    state.isSubmitting = false;
                }
            },
        };

        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['Taxs']);
                await SecurityManager.validateToken();
                await methods.populateMainData();
                mainGrid.create(state.mainData);
                nameText.create();
                percentageText.create();
                mainModalRef.value?.addEventListener('hidden.bs.modal', () => resetFormState());
            } catch (e) {
                console.error('page init error:', e);
            }
        });

        Vue.onUnmounted(() => {
            mainModalRef.value?.removeEventListener('hidden.bs.modal', resetFormState);
            if (mainGrid.obj) mainGrid.obj.destroy();
        });

        const mainGrid = {
            obj: null,
            create: (dataSource) => {
                mainGrid.obj = new DataTable('#mainGrid', {
                    data: dataSource,
                    columns: [
                        { data: 'name', title: 'Name' },
                        { data: 'percentage', title: 'Percentage', className: 'text-end', render: d => d != null ? Number(d).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '' },
                        { data: 'description', title: 'Description' },
                        { data: 'createdAtUtc', title: 'Created At', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                    ],
                    order: [[3, 'desc']],
                    pageLength: 50,
                    lengthMenu: [[10, 25, 50, 100, -1], ['10', '25', '50', '100', 'All']],
                    select: { style: 'single', info: false },
                    buttons: [{ extend: 'excelHtml5', title: 'Taxes', exportOptions: { columns: ':visible' } }],
                    layout: { topStart: null, topEnd: { search: { placeholder: 'Search...' } }, bottomStart: 'info', bottomEnd: 'paging' }
                });
                mainGrid.obj.on('select deselect', () => { state.hasSelection = mainGrid.obj.rows({ selected: true }).count() > 0; });
            },
            refresh: () => { mainGrid.obj.clear().rows.add(state.mainData).draw(); },
            _populateState: (row) => { state.id = row.id ?? ''; state.name = row.name ?? ''; state.percentage = row.percentage ?? ''; state.description = row.description ?? ''; }
        };

        return { mainModalRef, nameRef, percentageRef, state, handler };
    }
};

Vue.createApp(App).mount('#app');
