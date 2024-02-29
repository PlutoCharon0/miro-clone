export type Color = {
	r: number
	g: number
	b: number
}

export type Camera = {
	x: number
	y: number
}

export enum LayerType {
	Rectangle,
	Ellipse,
	Path,
	Text,
	Note,
}

export type RectangleLayer = {
	type: LayerType.Rectangle
	x: number
	y: number
	height: number
	width: number
	fill: Color
	value?: string
}

export type EllipseLayer = {
	type: LayerType.Ellipse
	x: number
	y: number
	height: number
	width: number
	fill: Color
	value?: string
}

export type PathLayer = {
	type: LayerType.Path
	x: number
	y: number
	height: number
	width: number
	fill: Color
	points: number[][]
	value?: string
}

export type TextLayer = {
	type: LayerType.Text
	x: number
	y: number
	height: number
	width: number
	fill: Color
	value?: string
}

export type NoteLayer = {
	type: LayerType.Note
	x: number
	y: number
	height: number
	width: number
	fill: Color
	value?: string
}

export type Point = {
	x: number
	y: number
}

export type XYWH = {
	x: number
	y: number
	width: number
	height: number
}

export enum Side {
	Top = 1,
	Bottom = 2,
	Left = 4,
	Right = 8,
}

// 定义画布的操作状态
export type CanvasState =
	| {
			// 无操作
			mode: CanvasMode.None
	  }
	| {
			// 选择操作
			mode: CanvasMode.SelectionNet
			origin: Point // 选择操作的起始点坐标
			current?: Point // 当前鼠标位置的坐标 用于表示选择的区域范围
	  }
	| {
			// 移动（拖拽）操作
			mode: CanvasMode.Translating
			current: Point // 当前鼠标位置，用于计算对象移动的距离和方向。
	  }
	| {
			// 图层插入操作
			mode: CanvasMode.Inserting
			layerType: // 图层类型
			| LayerType.Ellipse // 圆形
				| LayerType.Rectangle // 正方形
				| LayerType.Text // 文本
				| LayerType.Note //	便签
	  }
	| {
			// 绘图操作
			mode: CanvasMode.Pencil
	  }
	| {
			// 按压操作（用于选中范围）
			mode: CanvasMode.Pressing
			origin: Point // 按下时的位置坐标。
	  }
	| {
			// 缩放操作
			mode: CanvasMode.Resizing
			initialBounds: XYWH // 原始尺寸
			corner: Side // 指定 正在调整的边界角落
	  }

// 定义操作类型
export enum CanvasMode {
	None,
	Pressing,
	SelectionNet,
	Translating,
	Inserting,
	Resizing,
	Pencil,
}

// 图层类型中的 x y 指定的是图层在插入时的起始坐标点
export type Layer =
	| RectangleLayer
	| EllipseLayer
	| PathLayer
	| TextLayer
	| NoteLayer
