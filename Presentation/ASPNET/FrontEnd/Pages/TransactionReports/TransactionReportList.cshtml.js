const App = {
    setup() {
        const state = Vue.reactive({
            mainData: []
        });

        const services = {
            getMainData: async () => {
                try {
                    const response = await AxiosManager.get('/InventoryTransaction/GetInventoryTransactionList', {});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
        };

        const methods = {
            populateMainData: async () => {
                const response = await services.getMainData();
                state.mainData = response?.data?.content?.data.map(item => ({
                    ...item,
                    createdAtUtc: new Date(item.createdAtUtc),
                    movementDate: new Date(item.movementDate)
                }));
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
                        { data: 'warehouseName', title: 'Warehouse' },
                        { data: 'productName', title: 'Product' },
                        { data: 'movementDate', title: 'Movement Date', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                        { data: 'number', title: 'Number' },
                        { data: 'movement', title: 'Movement', className: 'text-end', render: d => d != null ? Number(d).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '' },
                        { data: 'transTypeName', title: 'Trans Type' },
                        { data: 'stock', title: 'Stock', className: 'text-end', render: d => d != null ? Number(d).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '' },
                        { data: 'statusName', title: 'Status' },
                        { data: 'moduleName', title: 'Module' },
                        { data: 'moduleCode', title: 'Module Code' },
                        { data: 'moduleNumber', title: 'Module Number' },
                        { data: 'warehouseFromName', title: 'Warehouse From' },
                        { data: 'warehouseToName', title: 'Warehouse To' },
                        { data: 'createdAtUtc', title: 'Created At', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                    ],
                    order: [[13, 'desc']],
                    pageLength: 50,
                    lengthMenu: [[10, 25, 50, 100, -1], ['10', '25', '50', '100', 'All']],
                    buttons: [{ extend: 'excelHtml5', title: 'Transaction Reports', exportOptions: { columns: ':visible' } }],
                    layout: { topStart: null, topEnd: { search: { placeholder: 'Search...' } }, bottomStart: 'info', bottomEnd: 'paging' }
                });
            },
            refresh: () => { mainGrid.obj.clear().rows.add(state.mainData).draw(); },
        };

        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['TransactionReports']);
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
