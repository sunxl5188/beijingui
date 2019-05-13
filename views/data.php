<?php
$action = !empty($_GET['action']) ? $_GET['action'] : '';
$sbType = !empty($_POST['sbType']) ? $_POST['sbType'] : '';
switch ($action) {
    case 1:
        $variable = ($sbType) ? array(11, 12, 13, 14, 15, 16, 17, 18, 19, 20) : array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        foreach ($variable as $key => $value) {
            $arr[$value] = array(
                "id" => $key + 1,
                "pid" => 'A' . $value,
                "title" => "设备名称" . $value,
                "maintain" => "是",
                "repair" => "否"
            );
        }
        $newArr = array(
            "status" => 1,
            "msg" => '成功',
            "data" => $arr
        );
        echo json_encode($newArr);
        break;

    case 2:
        $arr = array(
            "status" => 1,
            "msg" => "成功",
            "data" => array(
                "title" => "维修保养折线图",
                "legend" => array(
                    //折线数据
                    array('保养计划', '#ffff00', 2, 4, 2, 6, 2, 4, 2),
                    array('实际保养记录', '#00ff00', 2, 6, 2, 4, 2, 6, 4),
                    array('维修记录', '#ff0000', 2, 6, 6, 2, 4, 4, 6)
                ),
                "date" => array('2018-01', '2018-02', '2018-03', '2018-04', '2018-05', '2018-06', '2018-07', '2018-08', '2018-09', '2018-10', '2018-11', '2018-12'),
                "explain" => array('2' => '设备水平校准检查更换挡砂布', '4' => '自定义信息-------', '6' => '自定义信息222222222')
            )
        );
        echo json_encode($arr);
        break;
    case 3:
        $arr = array(
            'status' => 1
        );
        echo json_encode($arr);
        break;
    default:

}