const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false
        });

        const services = {
            getMainData: async () => {
                try {
                    const response = await AxiosManager.get('/NumberSequence/GetNumberSequenceList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
        };

        const methods = {
            populateMainData: async () => {
                const response = await services.getMainData();
                state.mainData = response?.data?.content?.data.map(item => ({ ...item, createdAtUtc: new Date(item.createdAtUtc) }));
            },
        };

        const handler = {
            exportExcel: () => { mainGrid.obj?.button(0).trigger(); },
        };

        const mainGrid = {
            obj: null,
            create: (dataSource) => {
                mainGrid.obj = new DataTable('#mainGrid', {
                    data: dataSource,
                    columns: [
                        { data: 'entityName', title: 'Entity Name' },
                        { data: 'prefix', title: 'Prefix' },
                        { data: 'suffix', title: 'Suffix' },
                        { data: 'lastUsedCount', title: 'Last Used Count' },
                        { data: 'createdAtUtc', title: 'Created At', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                    ],
                    order: [[4, 'desc']],
                    pageLength: 50,
                    lengthMenu: [[10, 25, 50, 100, -1], ['10', '25', '50', '100', 'All']],
                    buttons: [{ extend: 'excelHtml5', title: 'Number Sequences', exportOptions: { columns: ':visible' } }],
                    layout: { topStart: null, topEnd: { search: { placeholder: 'Search...' } }, bottomStart: 'info', bottomEnd: 'paging' }
                });
            },
            refresh: () => { mainGrid.obj.clear().rows.add(state.mainData).draw(); }
        };

        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['NumberSequences']);
                await SecurityManager.validateToken();
                await methods.populateMainData();
                mainGrid.create(state.mainData);
            } catch (e) {
                console.error('page init error:', e);
            }
        });

        Vue.onUnmounted(() => {
            if (mainGrid.obj) mainGrid.obj.destroy();
        });

        return { state, handler };
    }
};

Vue.createApp(App).mount('#app');
