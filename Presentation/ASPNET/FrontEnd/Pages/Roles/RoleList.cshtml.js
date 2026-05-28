const App = {
    setup() {
        const state = Vue.reactive({
            mainData: []
        });

        const services = {
            getMainData: async () => {
                try {
                    const response = await AxiosManager.get('/Security/GetRoleList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
        };

        const methods = {
            populateMainData: async () => {
                const response = await services.getMainData();
                state.mainData = response?.data?.content?.data;
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
                        { data: 'name', title: 'Name' },
                    ],
                    order: [[0, 'asc']],
                    pageLength: 50,
                    lengthMenu: [[10, 25, 50, 100, -1], ['10', '25', '50', '100', 'All']],
                    buttons: [{ extend: 'excelHtml5', title: 'Roles', exportOptions: { columns: ':visible' } }],
                    layout: { topStart: null, topEnd: { search: { placeholder: 'Search...' } }, bottomStart: 'info', bottomEnd: 'paging' }
                });
            },
            refresh: () => { mainGrid.obj.clear().rows.add(state.mainData).draw(); }
        };

        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['Roles']);
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
