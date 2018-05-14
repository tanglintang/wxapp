//index.js
//获取应用实例
const util = require('../../utils/util.js')
const app = getApp()

Page({
	// 数据 对应着 界面状态
	// 数据状态
	data: {
		// 默认的 status 是 1 全部
		// setData => 2 未完成
		//            3 已完成
		status: 1,
		// 界面状态要被 data 全面接管
		addFormShow: false,
		addText: '',
		lists: [],
	},

	curLists: [],

	reset: function(lists) {
		lists = lists == '' ? [] : lists
		lists.forEach(item => {
			item.contStyle = ''
		})
	},

	//事件处理函数
	// 删除
	deleteItem: function (e) {
		let that = this
		const index = e.currentTarget.dataset.id
		const temp = this.data.lists
		wx.showModal({
			title: '您确定要删除吗？',
			content: '',
			cancelText: '考虑一下',		// 最大四个汉字
			success: function (res) {
				if (res.confirm) {
					console.log('删除成功')
					temp.splice(index, 1)
					that.setData({
						lists: temp,
						curLists: temp
					})
					that.save()
				} else {
					console.log('取消')
				}

			}
		})
	},

	// 触摸开始
	touchS: function (e) {
		// console.log('开始：' + JSON.stringify(e))
		// 是否只有一个触摸点
		if (e.touches.length === 1) {
			// console.log(e.touches[0].clientX)
			// return
			this.setData({
				// 触摸起始的X坐标
				startX: e.touches[0].clientX
			})
		}
	},
	// 触摸移动
	touchM: function (e) {
		// console.log(e)
		// console.log('移动：' + JSON.stringify(e))
		let that = this
		if (e.touches.length === 1) {
			// 触摸点的X坐标
			let moveX = e.touches[0].clientX
			// console.log(moveX)
			// 计算手指起始点的X坐标与当前触摸点的X坐标的差值
			let disX = that.data.startX - moveX

			// console.log(disX)
			// return

			let contStyle = ''
			if (disX < 0) {
				contStyle = 'moveRight'
			} else if (disX > 0) {
				contStyle = 'moveLeft'
			}
			// 获取手指触摸的是哪一个item
			const index = e.currentTarget.dataset.id
			let temp = that.data.lists

			// 将拼接好的样式设置到当前item中
			temp[index].contStyle = contStyle
			// 更新列表的状态
			this.setData({
				curLists: temp,
				status: 1
			});
		}
	},

	//保存方法，将todo-list和todo-logs保存在小程序本地，通过调用小程序开放api wx.setStorageSync()
	save: function () {
		wx.setStorageSync('todo_list', this.data.lists)
		// wx.setStorageSync('todo_logs', this.data.logs)
	},

	//加载本地缓存中的todo-list

	load: function () {
		const lists = wx.getStorageSync('todo_list')

		this.reset(lists)
		this.setData({
			lists: lists,
			curLists: lists
		})
	},

	onLoad: function () {
		this.load()
		// wx.clearStorage('todo_list')
	},

	showStatus: function (status, target) {
		this.reset(target)
		// console.log(target)
		if (status == '1') {
			return [...target]
		}
		// 未完成
		if (status == '2') {
			return target.map(item => {
				return item.status == '0' ? item : ''
			})
			console.log(this.curLists)
		}
		// 已完成
		if (status == '3') {
			return target.map(item => {
				return item.status == '1' ? item : ''
			})
			console.log(this.curLists)
		}
	},

	showTime: function (time) {
		if (time < 100) {
			return '1分钟前'
		} else if (100 < time && time < 6000) {
			return Math.floor(time / 100) + '分钟前'
		} else if (6000 < time & time < 1000000) {
			return Math.floor(time / 10000) == 0 ? 1 + '小时前' : Math.floor(time / 10000) + '小时前'
		} else {
			return util.formatTime(new Date())
		}
	},

	showLists(e) {
		// e 事件对象
		const status = e.currentTarget.dataset.status

		const temp = this.data.lists == '' ? [] : this.data.lists
		// console.log(temp)		

		this.curLists = this.showStatus(status, temp)

		for (let i = 0; i < this.curLists.length + 1; i++) {
			this.curLists.forEach((item, index) => {
				if (item == '') {
					// console.log(item, index)
					this.curLists.splice(index, 1)
				}
			})
		}

		// 更新时间
		const reg = /\/|\s+|:/g

		// console.log(util.formatTime(new Date()))
		// return;
		temp.forEach(item => {
			// console.log(item.time)
			let curTime = util.formatTime(new Date()).replace(reg, '')
			let date = Number(curTime - item.time.replace(reg, ''))

			item.date = this.showTime(date)
		})


		this.setData({
			status: status,
			curLists: this.curLists
		})

	},

	addTodo: function (e) {
		
		if (!this.data.addText || !this.data.addText.trim()) {
			wx.showToast({
				title: '请输入',
				icon: 'loading',
				duration: 1000
			})
			return
		}
		// 如何添加一个新的 ToDo
		// 页面上多一条任务
		// 显示多少条 由 lists 决定
		// lists push
		// 数据驱动界面 数据改变界面自动更新

		// 取当前时间
		// const reg = /\/|\s+|:/g
		// const time = util.formatTime(new Date()).replace(reg, '')
		const time = util.formatTime(new Date())

		// 获取输入框的内容
		const task = {
			title: this.data.addText,
			// title: '烤面筋可带劲了',
			date: '刚刚',
			time: time,
			status: '0',
			contStyle: '',
			id: time
		}

		// es6 数组插入数据
		const temp = [...this.data.lists, task]
		// console.log(temp)

		this.setData({
			lists: temp,
			curLists: temp,
			addFormShow: false,
			addText: ''
		})

		this.save()

		// 看到界面，我们就知道要的数据
		// 看到交互，了解对数据的操作
	},

	addTodoShow: function (e) {
		this.load()
		this.setData({
			addFormShow: true
		})
		this.save()
	},

	addTodoHide: function (e) {
		this.setData({
			addFormShow: false
		})
		this.save()
	},

	setInput: function (e) {
		// console.log(e.detail.value)
		this.setData({
			addText: e.detail.value
		})
	},

	changeTodo: function (e) {
		// console.log(e)
		const index = e.currentTarget.dataset.id
		// console.log(index)
		const temp = this.data.lists
		temp.forEach((item) => {
			// console.log(item.id)
			// return
			if (item.id == index) {
				if (item.status == '0') {
					item.status = '1'
					// 小程序API 弹出提示
					wx.showToast({
						title: '已完成任务',
						icon: 'success',
						duration: 1000
					})
				} else {
					item.status = '0'
					wx.showToast({
						title: '任务打回重做',
						// icon只支持 success loading
						// icon: 'circle',
						duration: 1000
					})
				}
			}
		})
		this.setData({
			lists: temp,
			curLists: temp,
			status: 1
		})
		// 当前点击条目的 status => success
		// 数据 lists 跟当前条目相关的这一条数据
		// status = 1
		// index

		this.save()
	}
})
