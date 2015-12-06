# 字体大小自适应容器


<link rel="stylesheet" type="text/css" href="./modules/panel/index.scss">


````html
<script src="https://cdn.bootcss.com/handlebars.js/4.0.4/handlebars.js"></script>
<!-- 容器 -->
<div class="p-panel p-panel-bgcolor0" id="fonttag">
    <!--     <div class="p-panel-item  p-panel-lower">
            <div class="p-panel-item-head p-panel-bgcolor1">今日新增用户数</div>
            <div class="p-panel-item-content">11111111111111111111111111111111111111111111</div>
        </div>
        <div class="p-panel-item ">
            <div class="p-panel-item-head p-panel-bgcolor2">当月用户数</div>
            <div class="p-panel-item-content">99999999999999999999999999999999999999</div>
        </div>
        <div class="p-panel-item ">
            <div class="p-panel-item-head p-panel-bgcolor3">总用户数</div>
            <div class="p-panel-item-content">2222222222222222222222222222222</div>
        </div>
        <div class="p-panel-item  p-panel-up">
            <div class="p-panel-item-head p-panel-bgcolor4">今日新增任务数</div>
            <div class="p-panel-item-content">333333333333333333333333</div>
        </div>
        <div class="p-panel-item ">
            <div class="p-panel-item-head p-panel-bgcolor5">总任务数</div>
            <div class="p-panel-item-content">44444444444444444</div>
        </div>
        <div class="p-panel-item ">
            <div class="p-panel-item-head p-panel-bgcolor6">任务提交邮址数</div>
            <div class="p-panel-item-content">555555555</div>
        </div>
        <div class="p-panel-item ">
            <div class="p-panel-item-head p-panel-bgcolor7">任务发送邮址数</div>
            <div class="p-panel-item-content">66666</div>
        </div>
        <div class="p-panel-item ">
            <div class="p-panel-item-head p-panel-bgcolor8">免费发送邮址数</div>
            <div class="p-panel-item-content">7</div>
        </div> -->
</div>
<!-- 模板 -->
<script type="text/template" id="fonttpl">
    {{#each fontjson}}
        <div class="p-panel-item">
            <div class="p-panel-item-head p-panel-bgcolor1">{{title}}</div>
            <div class="p-panel-item-content  p-panel-{{change}}">{{data}}</div>
        </div>
    {{/each}}
</script>
<!-- 数据源 -->
<script type="text/template" id="fontjson">
    {
        "fontjson":[
            {
                "title":"今日新增用户数",
                "data":"1111111111111111",
                "change":"lower"
            },
            {
                "title":"当月用户数",
                "data":"99999999999999",
                "change":"up"
            },
            {
                "title":"总用户数",
                "data":"222222222222",
                "change":"up"
            },
            {
                "title":"今日新增任务数",
                "data":"3333333333",
                "change":"lower"
            },
            {
                "title":"总任务数",
                "data":"44444444",
                "change":"lower"
            },
            {
                "title":"任务提交邮址数",
                "data":"55555",
                "change":"lower"
            },
            {
                "title":"任务发送邮址数",
                "data":"666",
                "change":"up"
            },
            {
                "title":"免费发送邮址数",
                "data":"7",
                "change":"lower"
            }
        ]
    }
</script>
````
````js
require.async(['modules/panel/index.js'],function(fn){
	fn()
})
````