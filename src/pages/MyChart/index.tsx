import { listMyChartByPageUsingPost } from '@/services/yqbi/chartController';
import { useModel } from '@umijs/max';
import { Avatar, Card, List, message, Result } from 'antd';
import Search from 'antd/es/input/Search';
import ReactECharts from 'echarts-for-react';
import React, { useEffect, useState } from 'react';

/**
 * 添加图表页面
 * @constructor
 */
const MyChartPage: React.FC = () => {
  const initSearchParams = {
    current: 1,
    pageSize: 4,
    sortField: 'createTime',
    sortOrder: 'desc',
  };
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState ?? {};
  // 查询条件以及其更新函数，{...}是展开语法
  const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>({ ...initSearchParams });
  // 存储图标数据
  const [chartList, setChartList] = useState<API.Chart[]>();
  // 数据总数
  const [chartTotal, setChartTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  // 获取数据的异步函数
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listMyChartByPageUsingPost(searchParams);
      if (res.data) {
        // 如果返回数据不为空,将数据返回给前端
        setChartList(res.data.records ?? []);
        setChartTotal(res.data.total ?? 0);
        if (res.data.records) {
          // 去除所有图标的标题
          res.data.records.forEach((date) => {
            if (date.status === 'succeed') {
              const chartOption = JSON.parse(date.genChart ?? '{}');
              chartOption.title = undefined;
              date.genChart = JSON.stringify(chartOption);
            }
          });
        }
      } else {
        // 返回数据为空，提示失败
        message.error('获取我的图表失败');
      }
    } catch (e: any) {
      // 出现异常，打印错误信息
      message.error('获取我的图表失败,' + e.message);
    }
    setLoading(false);
  };

  // 首次加载,或数组内参数发生改变时，触发加载数据
  useEffect(() => {
    loadData();
  }, [searchParams]);

  return (
    <div className="my-chart-page">
      {/*引入搜索框*/}
      <div>
        <Search
          placeholder="请输入图表名称"
          loading={loading}
          enterButton
          onSearch={(value) => {
            // 设置搜索条件
            setSearchParams({
              // 展开原始搜索条件
              ...initSearchParams,
              // 搜索词
              name: value,
            });
          }}
        />
        <br />
      </div>
      <div className="margin-16" />
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 2,
          xxl: 2,
        }}
        pagination={{
          onChange: (page, pageSize) => {
            setSearchParams({
              ...searchParams,
              current: page,
              pageSize,
            });
          },
          current: searchParams.current,
          pageSize: searchParams.pageSize,
          total: chartTotal,
        }}
        loading={loading}
        dataSource={chartList}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <Card>
              {/*要展示的列表的元素信息*/}
              <List.Item.Meta
                // 头像
                avatar={<Avatar src={currentUser && currentUser.userAvatar} />}
                // 图表名称
                title={item.name}
                description={item.chartType ? '图标类型' + item.chartType : undefined}
              />
              <>
                {
                  // 当前状态为 wait 时，显式等待生成的结果组件
                  item.status === 'wait' && (
                    <>
                      <Result
                        // 状态为警告
                        status="warning"
                        title="图表待生成"
                        // 子标题展示执行消息
                        subTitle={item.execMessage ?? '当前生成图表队列繁忙，请耐心等待'}
                      />
                    </>
                  )
                }
                {
                  // 当前状态为 running
                  item.status === 'running' && (
                    <>
                      <Result
                        // 状态为信息
                        status="info"
                        title="图表生成中"
                        // 子标题展示执行消息
                        subTitle={item.execMessage}
                      />
                    </>
                  )
                }
                {
                  // 当前状态为 succeed，显式生成的图表
                  item.status === 'succeed' && (
                    <>
                      <div style={{ marginBottom: 16 }} />
                      {/*最终的展示内容*/}
                      <p>{'分析目标' + item.goal}</p>
                      <div style={{ marginBottom: 16 }} />
                      <ReactECharts option={item.genChart && JSON.parse(item.genChart)} />
                    </>
                  )
                }
                {
                  // 当前状态为 failed，显式生成失败的结果组件内
                  item.status === 'failed' && (
                    <>
                      <Result
                        // 状态为信息
                        status="error"
                        title="图表生成失败"
                        // 子标题展示执行消息
                        subTitle={item.execMessage}
                      />
                    </>
                  )
                }
              </>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};
export default MyChartPage;
