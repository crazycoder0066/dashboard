const App = {
    setup() {
        const state = Vue.reactive({
            mainData: []
        });

        const services = {
            getMainData: async () => {
                try {
                    const response = await AxiosManager.get('/InventoryTransaction/GetInventoryStockList', {});
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
                        { data: 'productName', title: 'Product Name' },
                        { data: 'productNumber', title: 'Product Number' },
                        { data: 'stock', title: 'Stock', className: 'text-end', render: d => d != null ? Number(d).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '' },
                        { data: 'statusName', title: 'Status' },
                        { data: 'createdAtUtc', title: 'Created At', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                    ],
                    order: [[5, 'desc']],
                    pageLength: 50,
                    lengthMenu: [[10, 25, 50, 100, -1], ['10', '25', '50', '100', 'All']],
                    buttons: [{ extend: 'excelHtml5', title: 'Stock Reports', exportOptions: { columns: ':visible' } }],
                    layout: { topStart: null, topEnd: { search: { placeholder: 'Search...' } }, bottomStart: 'info', bottomEnd: 'paging' }
                });
            },
            refresh: () => { mainGrid.obj.clear().rows.add(state.mainData).draw(); },
        };

        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['StockReports']);
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
